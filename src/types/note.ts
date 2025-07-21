/**
 * Type definitions for sticky notes
 */

export interface NoteType {
  id?: string;
  content: string;
  position?: { x: number; y: number };
  color?: string;
  created_at?: Date;
  updated_at?: Date;
  user_id?: string;
}
