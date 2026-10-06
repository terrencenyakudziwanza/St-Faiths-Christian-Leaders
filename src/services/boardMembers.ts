import { supabase } from "../lib/supabase";
import { resolveMediaUrl } from "../lib/media";

export type BoardMemberRecord = {
  id: string;
  name: string;
  position: string;
  boardTier: string;
  quote: string;
  imagePath: string | null;
  imageSrc: string;
  executive: boolean;
};

type Row = { id: string; name: string; position: string; board_tier: string; quote: string; image_path: string | null; executive: boolean };

function mapRow(row: Row): BoardMemberRecord {
  return { id: row.id, name: row.name, position: row.position, boardTier: row.board_tier, quote: row.quote, imagePath: row.image_path, imageSrc: resolveMediaUrl(row.image_path) ?? "/offline-media/presenters/elder-kojo.jpg", executive: row.executive };
}

export async function fetchBoardMembers(): Promise<BoardMemberRecord[]> {
  const { data, error } = await supabase.from("board_members").select("id,name,position,board_tier,quote,image_path,executive").order("sort_order").order("created_at");
  if (error) throw new Error(`Failed to load board members: ${error.message}`);
  return ((data ?? []) as Row[]).map(mapRow);
}

export async function saveBoardMember(input: Omit<BoardMemberRecord, "imageSrc">, existingId?: string): Promise<void> {
  const values = { name: input.name, position: input.position, board_tier: input.boardTier, quote: input.quote, image_path: input.imagePath, executive: input.executive };
  const query = existingId
    ? await supabase.from("board_members").update(values).eq("id", existingId)
    : await supabase.from("board_members").insert(values);
  if (query.error) throw new Error(`Failed to save board member: ${query.error.message}`);
}

export async function removeBoardMember(id: string): Promise<void> {
  const { error } = await supabase.from("board_members").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete board member: ${error.message}`);
}
