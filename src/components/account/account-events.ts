/**
 * Fired on `window` when a profile dialog saves something (phone, personal
 * data, an address, a billing profile). The account tabs fetch their content
 * on mount and `router.refresh()` does not remount them, so without this a
 * tab that was already open kept showing the data from before the save.
 */
export const ACCOUNT_DATA_SAVED_EVENT = 'account:data-saved';
