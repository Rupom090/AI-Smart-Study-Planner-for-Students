import axios from 'axios';
import { showToast } from '../lib/toast';

export interface ExportOptions {
  format?: 'csv' | 'json';
  startDate?: string;
  endDate?: string;
}

class ExportService {
  private static readonly BASE_URL = '/api/v1/export';

  private async download(url: string, filename: string, options: ExportOptions = {}) {
    const toastId = showToast.loading('Preparing export...');

    try {
      const response = await axios.get(url, {
        params: {
          format: options.format || 'csv',
          start_date: options.startDate,
          end_date: options.endDate,
        },
      });

      showToast.dismiss(toastId);

      if (response.data.success && response.data.data.download_url) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = response.data.data.download_url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast.success('Export downloaded successfully!');
      } else {
        showToast.error('Failed to generate export');
      }
    } catch (error: any) {
      showToast.dismiss(toastId);
      showToast.error(error.response?.data?.message || 'Export failed');
      throw error;
    }
  }

  async exportFiles(options: ExportOptions = {}) {
    const filename = `files-export-${Date.now()}.${options.format || 'csv'}`;
    return this.download(`${ExportService.BASE_URL}/files`, filename, options);
  }

  async exportNotifications(options: ExportOptions = {}) {
    const filename = `notifications-export-${Date.now()}.${options.format || 'csv'}`;
    return this.download(`${ExportService.BASE_URL}/notifications`, filename, options);
  }

  async exportAnalytics(options: ExportOptions = {}) {
    const filename = `analytics-export-${Date.now()}.${options.format || 'csv'}`;
    return this.download(`${ExportService.BASE_URL}/analytics`, filename, options);
  }
}

export default new ExportService();
