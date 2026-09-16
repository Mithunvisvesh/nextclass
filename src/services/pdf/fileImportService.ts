import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { parseTimetable, ParsedTimetableResult } from './timetableParser';
import { parseAcademicCalendar, ParsedCalendarResult } from './calendarParser';

export interface FileImportError {
  error: string;
  isCancelled?: boolean;
}

/**
 * Reads a picked PDF file as Base64 string across React Native (Android/iOS) and Web.
 */
async function readPdfFileAsBase64(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        // remove data url prefix if present
        const base64 = res.includes(',') ? res.split(',')[1] : res;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Native Android & iOS using expo-file-system
  return await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

/**
 * Prompt user to select a timetable PDF and parse it.
 */
export async function pickAndParseTimetable(): Promise<
  { success: true; result: ParsedTimetableResult } | { success: false; error: string; isCancelled?: boolean }
> {
  try {
    const pickerResult = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
      return { success: false, error: 'File selection cancelled.', isCancelled: true };
    }

    const asset = pickerResult.assets[0];
    if (!asset.name.toLowerCase().endsWith('.pdf') && asset.mimeType !== 'application/pdf') {
      return { success: false, error: 'Please select a valid PDF file (.pdf).' };
    }

    const base64 = await readPdfFileAsBase64(asset.uri);
    const parsed = parseTimetable(base64);

    if (!parsed.success || parsed.classes.length === 0) {
      return {
        success: false,
        error:
          'Could not extract timetable classes from this PDF. Please check if it contains searchable text, or enter your classes manually.',
      };
    }

    return { success: true, result: parsed };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to read the selected PDF file. Please try again.',
    };
  }
}

/**
 * Prompt user to select an academic calendar PDF and parse it.
 */
export async function pickAndParseCalendar(): Promise<
  { success: true; result: ParsedCalendarResult } | { success: false; error: string; isCancelled?: boolean }
> {
  try {
    const pickerResult = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
      return { success: false, error: 'File selection cancelled.', isCancelled: true };
    }

    const asset = pickerResult.assets[0];
    if (!asset.name.toLowerCase().endsWith('.pdf') && asset.mimeType !== 'application/pdf') {
      return { success: false, error: 'Please select a valid PDF file (.pdf).' };
    }

    const base64 = await readPdfFileAsBase64(asset.uri);
    const parsed = parseAcademicCalendar(base64);

    if (!parsed.success || parsed.entries.length === 0) {
      return {
        success: false,
        error:
          'Could not extract calendar events from this PDF. Please check if it contains searchable text, or enter events manually.',
      };
    }

    return { success: true, result: parsed };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to read the selected PDF file. Please try again.',
    };
  }
}
