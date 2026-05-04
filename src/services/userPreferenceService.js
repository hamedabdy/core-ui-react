import ApiService from "./ApiService";

const PREF_TABLE = "sys_user_preference";
const buildPrefName = (tableName) => `list.columns.${tableName}`;

/**
 * Load column preference for a given table.
 * Returns the saved columns array, or null if no preference exists yet.
 */
export const loadListColumnPref = async (tableName) => {
  const resp = await ApiService.getData({
    table_name: PREF_TABLE,
    sysparm_query: `name=${buildPrefName(tableName)}^system=true`,
    sysparm_fields: "sys_id,name,value",
  });

  const rows = resp.data ?? [];
  if (rows.length === 0) return null;

  const record = rows[0];
  const parsed = JSON.parse(record.value ?? "{}");
  return {
    sys_id: record.sys_id,
    columns: Array.isArray(parsed.columns) ? parsed.columns : [],
  };
};

/**
 * Save (upsert) column preference for a given table.
 * Internally uses addData upsert — sys_id present = update, absent = create.
 */
export const saveListColumnPref = async (tableName, columns, existingSysId = null) => {
    const prefName  = buildPrefName(tableName);
    // Always look up the existing record by name — single source of truth
    const resp = await ApiService.getData({
        table_name:     PREF_TABLE,
        sysparm_query:  `name=${prefName}^system=true`,
        sysparm_fields: "sys_id",
    });

    const raw      = resp.data;
    const rows     = Array.isArray(raw) ? raw : (Array.isArray(raw?.rows) ? raw.rows : []);
    const existing = rows[0] ?? null;

    const result = await ApiService.addData(PREF_TABLE, {
        ...(existing?.sys_id ? { sys_id: existing.sys_id } : {}),
        name: prefName,
        value: JSON.stringify({columns}),
        system: true,
        // user field intentionally empty — no IAM yet
    });

    return result?.data?.sys_id ?? existingSysId;
};