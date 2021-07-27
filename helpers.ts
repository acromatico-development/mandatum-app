export const serverUrl: string = "mandatum-app.uc.r.appspot.com";

export function futureDay(days) {
  var result: Date = new Date();
  result.setDate(result.getDate() + days);
  return result.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "2-digit"
  });
}

export function formatMoney(number: number, currency: string): string {
  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  });

  return formatter.format(number);
}