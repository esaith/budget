export function sortByOrder(a: { Order: number }, b: { Order: number }): number {
    if (!a && !b) return 0;
    if (!a && b) return 1;
    if (a && !b) return -1;
    if (!a.Order && a.Order !== 0 && !b.Order && b.Order !== 0) return 0;
    if (!a.Order && a.Order !== 0 && b.Order) return 1;
    if (a.Order && !b.Order && b.Order !== 0) return -1;
    return a.Order < b.Order ? -1 : a.Order === b.Order ? 0 : 1;
}