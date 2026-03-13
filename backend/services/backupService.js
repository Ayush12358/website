const fs = require('fs-extra');
const path = require('path');
const cron = require('node-cron');
const crypto = require('crypto');

const isVercelRuntime = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
const sqliteStoragePath = process.env.SQLITE_STORAGE_PATH
  || (isVercelRuntime ? '/tmp/database.sqlite' : path.join(__dirname, '../database.sqlite'));
const backupsPath = process.env.BACKUPS_DIR
  || (isVercelRuntime ? '/tmp/backups' : path.join(__dirname, '../backups'));

class BackupService {
  constructor() {
    this.dbPath = sqliteStoragePath;
    this.backupDir = backupsPath;
    this.maxBackups = 30; // Keep 30 days of backups
    
    // Ensure backup directory exists
    this.ensureBackupDirectory();
  }

  async ensureBackupDirectory() {
    try {
      await fs.ensureDir(this.backupDir);
      console.log('Backup directory ensured:', this.backupDir);
    } catch (error) {
      console.error('Error creating backup directory:', error);
    }
  }

  generateBackupFilename() {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    return `database-backup-${timestamp}.sqlite`;
  }

  generateDailyBackupFilename() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
    return `database-backup-${dateStr}-daily.sqlite`;
  }

  async hasBackupToday() {
    try {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      if (isVercelRuntime) {
        const { list } = require('@vercel/blob');
        const { blobs } = await list({ prefix: `backups/database-backup-${today}` });
        return blobs.length > 0;
      }
      const files = await fs.readdir(this.backupDir);
      const todayBackups = files.filter(file => 
        file.startsWith(`database-backup-${today}`) && file.endsWith('.sqlite')
      );
      return todayBackups.length > 0;
    } catch (error) {
      console.error('Error checking for today\'s backup:', error);
      return false;
    }
  }

  async createDailyBackup() {
    try {
      // Check if we already have a backup for today
      if (await this.hasBackupToday()) {
        console.log('📅 Daily backup already exists for today, skipping...');
        return null;
      }

      const backupFilename = this.generateDailyBackupFilename();
      const backupPath = path.join(this.backupDir, backupFilename);

      // Check if database file exists
      if (!await fs.pathExists(this.dbPath)) {
        console.log('Database file does not exist yet, skipping daily backup');
        return null;
      }

      // Copy database file
      await fs.copy(this.dbPath, backupPath);
      
      // Create checksum for integrity verification
      const checksumPath = backupPath + '.checksum';
      const checksum = await this.calculateChecksum(backupPath);
      await fs.writeFile(checksumPath, checksum);

      console.log(`✅ Daily backup created: ${backupFilename}`);
      console.log(`📁 Backup path: ${backupPath}`);

      if (isVercelRuntime) {
        const { put } = require('@vercel/blob');
        const fileBuffer = await fs.readFile(backupPath);
        const blob = await put(`backups/${backupFilename}`, fileBuffer, { access: 'public' });
        console.log(`☁️  Daily backup uploaded to Blob: ${blob.url}`);
      }

      // Clean up old backups
      await this.cleanupOldBackups();
      
      return backupPath;
    } catch (error) {
      console.error('❌ Error creating daily backup:', error);
      throw error;
    }
  }

  async createBackup() {
    try {
      const backupFilename = this.generateBackupFilename();
      const backupPath = path.join(this.backupDir, backupFilename);

      // Check if database file exists
      if (!await fs.pathExists(this.dbPath)) {
        console.log('Database file does not exist yet, skipping backup');
        return null;
      }

      // Copy database file
      await fs.copy(this.dbPath, backupPath);
      
      // Create checksum for integrity verification
      const checksumPath = backupPath + '.checksum';
      const checksum = await this.calculateChecksum(backupPath);
      await fs.writeFile(checksumPath, checksum);

      console.log(`✅ Database backup created: ${backupFilename}`);
      console.log(`📁 Backup path: ${backupPath}`);

      if (isVercelRuntime) {
        const { put } = require('@vercel/blob');
        const fileBuffer = await fs.readFile(backupPath);
        const blob = await put(`backups/${backupFilename}`, fileBuffer, { access: 'public' });
        console.log(`☁️  Backup uploaded to Blob: ${blob.url}`);
      }

      // Clean up old backups
      await this.cleanupOldBackups();

      return backupPath;
    } catch (error) {
      console.error('❌ Error creating backup:', error);
      throw error;
    }
  }

  async calculateChecksum(filePath) {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    return new Promise((resolve, reject) => {
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  async verifyBackup(backupPath) {
    try {
      const checksumPath = backupPath + '.checksum';
      
      if (!await fs.pathExists(checksumPath)) {
        console.warn('⚠️ No checksum file found for backup verification');
        return false;
      }

      const storedChecksum = await fs.readFile(checksumPath, 'utf8');
      const currentChecksum = await this.calculateChecksum(backupPath);
      
      const isValid = storedChecksum.trim() === currentChecksum;
      console.log(isValid ? '✅ Backup integrity verified' : '❌ Backup integrity check failed');
      
      return isValid;
    } catch (error) {
      console.error('Error verifying backup:', error);
      return false;
    }
  }

  async cleanupOldBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files.filter(file => file.startsWith('database-backup-') && file.endsWith('.sqlite'));
      
      if (backupFiles.length <= this.maxBackups) {
        return;
      }

      // Sort by creation time (oldest first)
      const sortedFiles = backupFiles.map(file => ({
        name: file,
        path: path.join(this.backupDir, file),
        time: fs.statSync(path.join(this.backupDir, file)).birthtime
      })).sort((a, b) => a.time - b.time);

      // Remove oldest files
      const filesToRemove = sortedFiles.slice(0, sortedFiles.length - this.maxBackups);
      
      for (const file of filesToRemove) {
        await fs.remove(file.path);
        await fs.remove(file.path + '.checksum').catch(() => {}); // Remove checksum if exists
        console.log(`🗑️ Removed old backup: ${file.name}`);
      }

      console.log(`🧹 Cleanup complete. Kept ${this.maxBackups} most recent backups.`);
    } catch (error) {
      console.error('Error cleaning up old backups:', error);
    }
  }

  async listBackups() {
    try {
      if (isVercelRuntime) {
        const { list } = require('@vercel/blob');
        const { blobs } = await list({ prefix: 'backups/database-backup-' });
        const backupNames = blobs.map(b => path.basename(b.pathname));
        console.log(`📋 Available backups in Blob (${backupNames.length}):`);
        for (const b of blobs) {
          const size = (b.size / 1024).toFixed(2);
          console.log(`  - ${path.basename(b.pathname)} (${size} KB, ${b.uploadedAt})`);
        }
        return backupNames;
      }
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files.filter(file => file.startsWith('database-backup-') && file.endsWith('.sqlite'));
      
      console.log(`📋 Available backups (${backupFiles.length}):`);
      for (const file of backupFiles.sort().reverse()) {
        const filePath = path.join(this.backupDir, file);
        const stats = await fs.stat(filePath);
        const size = (stats.size / 1024).toFixed(2);
        console.log(`  - ${file} (${size} KB, ${stats.birthtime.toISOString()})`);
      }
      
      return backupFiles;
    } catch (error) {
      console.error('Error listing backups:', error);
      return [];
    }
  }

  async restoreBackup(backupFilename) {
    try {
      if (isVercelRuntime) {
        const { list, put } = require('@vercel/blob');
        // Find the blob for this filename
        const { blobs } = await list({ prefix: `backups/${backupFilename}` });
        const target = blobs.find(b => path.basename(b.pathname) === backupFilename);
        if (!target) throw new Error(`Backup not found in Blob storage: ${backupFilename}`);

        // Save current database to Blob before overwriting
        if (await fs.pathExists(this.dbPath)) {
          const currentBuf = await fs.readFile(this.dbPath);
          const preRestoreName = `backups/pre-restore-${Date.now()}.sqlite`;
          await put(preRestoreName, currentBuf, { access: 'public' });
          console.log(`📦 Current database backed up to Blob: ${preRestoreName}`);
        }

        // Download backup from Blob and write to writable path
        const response = await fetch(target.url);
        if (!response.ok) throw new Error(`Failed to download backup: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        await fs.writeFile(this.dbPath, Buffer.from(arrayBuffer));
        console.log(`✅ Database restored from Blob: ${backupFilename}`);
        return true;
      }

      const backupPath = path.join(this.backupDir, backupFilename);
      
      if (!await fs.pathExists(backupPath)) {
        throw new Error(`Backup file not found: ${backupFilename}`);
      }

      // Verify backup integrity before restore
      const isValid = await this.verifyBackup(backupPath);
      if (!isValid) {
        throw new Error('Backup integrity check failed. Restore aborted.');
      }

      // Create a backup of current database before restore
      if (await fs.pathExists(this.dbPath)) {
        const currentBackupPath = path.join(this.backupDir, `pre-restore-${Date.now()}.sqlite`);
        await fs.copy(this.dbPath, currentBackupPath);
        console.log(`📦 Current database backed up to: ${path.basename(currentBackupPath)}`);
      }

      // Restore the backup
      await fs.copy(backupPath, this.dbPath);
      console.log(`✅ Database restored from: ${backupFilename}`);
      
      return true;
    } catch (error) {
      console.error('❌ Error restoring backup:', error);
      throw error;
    }
  }

  startScheduledBackups() {
    // Run daily backups at 2:00 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('🕐 Starting scheduled daily backup...');
      try {
        await this.createDailyBackup();
        console.log('✅ Scheduled daily backup completed successfully');
      } catch (error) {
        console.error('❌ Scheduled daily backup failed:', error);
      }
    }, {
      scheduled: true,
      timezone: "America/New_York" // Adjust timezone as needed
    });

    console.log('📅 Daily backup schedule activated (2:00 AM)');
  }

  stopScheduledBackups() {
    cron.getTasks().forEach(task => task.destroy());
    console.log('🛑 Scheduled backups stopped');
  }
}

module.exports = BackupService;
