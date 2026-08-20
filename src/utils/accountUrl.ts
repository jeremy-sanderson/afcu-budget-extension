export function buildAccountDetailsUrl(accountId: string): string {
    return `https://digital.americafirst.com/americafirstdigitalbanking/uux.aspx#/account/${accountId}?currentTab=transactions&returnTo=Home`;
}
