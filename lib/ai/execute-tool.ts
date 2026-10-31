import type { SupabaseClient } from "@supabase/supabase-js";

export async function executeTool(
    name: string,
    supabase: SupabaseClient,
    companyId: number

) {
    switch (name) {
        case "get_employees": {
            const { data, error } = await supabase
                .from("users")
                .select("user_id, full_name, role")
                .eq("company_id", companyId);

            if (error) throw new Error("Could not fetch employees.");

            return {
                total: data.length,
                employees: data,
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}