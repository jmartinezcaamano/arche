export interface Incident {
  id: number;
  title: string;
  status: string;
  reportedBy: string;
}

/** Exporta la lista de incidencias como JSON legible. */
export function exportJson(items: Incident[]): string {
  return JSON.stringify(items, null, 2);
}
