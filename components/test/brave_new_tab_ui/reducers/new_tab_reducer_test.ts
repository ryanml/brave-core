/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

 // Constants
import { types } from '../../../brave_new_tab_ui/constants/new_tab_types'

// Reducer
import newTabReducer from '../../../brave_new_tab_ui/reducers/new_tab_reducer'

// State
import { newTabInitialState } from '../../testData'

// API
import * as gridAPI from '../../../brave_new_tab_ui/api/topSites/grid'
import * as bookmarksAPI from '../../../brave_new_tab_ui/api/topSites/bookmarks'
import * as dndAPI from '../../../brave_new_tab_ui/api/topSites/dnd'
import * as storage from '../../../brave_new_tab_ui/storage'

const initialState = newTabInitialState.newTabData

describe('newTabReducer', () => {
  const url: string = 'http://brave.com/'
  const topSites: Partial<NewTab.Sites> = [{ url }]
  const pinnedTopSites: Partial<NewTab.Sites> = topSites
  const ignoredTopSites: Partial<NewTab.Sites> = [{ url: 'https://github.com' }]
  const bookmarks: Partial<NewTab.Bookmark> = { [url]: { id: 'bookmark_id' } }
  const fakeState = {
    ...initialState,
    topSites,
    bookmarks,
    pinnedTopSites,
    ignoredTopSites
  }

  describe('initial state', () => {
    it('loads initial data', () => {
      const expectedState = storage.load()
      const returnedState = newTabReducer(undefined, {})
      expect(returnedState).toEqual(expectedState)
    })
  })
  describe('BOOKMARK_ADDED', () => {
    let spy: jest.SpyInstance
    beforeEach(() => {
      spy = jest.spyOn(chrome.bookmarks, 'create')
    })
    afterEach(() => {
      spy.mockRestore()
    })

    it('calls chrome.bookmarks.create if topSites url match payload url', () => {
      newTabReducer(fakeState, {
        type: types.BOOKMARK_ADDED,
        payload: { url }
      })
      expect(spy).toBeCalled()
    })
    it('does not call chrome.bookmarks.create if url does not match', () => {
      newTabReducer(fakeState, {
        type: types.BOOKMARK_ADDED,
        payload: { url: 'https://very-different-website-domain.com' }
      })
      expect(spy).not.toBeCalled()
    })
  })
  describe('BOOKMARK_REMOVED', () => {
    let spy: jest.SpyInstance
    beforeEach(() => {
      spy = jest.spyOn(chrome.bookmarks, 'remove')
    })
    afterEach(() => {
      spy.mockRestore()
    })

    it('calls chrome.bookmarks.remove if bookmarkInfo exists', () => {
      newTabReducer(fakeState, {
        type: types.BOOKMARK_REMOVED,
        payload: { url }
      })
      expect(spy).toBeCalled()
    })
    it('does not call chrome.bookmarks.remove if bookmarkInfo is undefined', () => {
      const newTabInitialStateWithoutBookmarks = { ...initialState, bookmarks: {} }
      newTabReducer(newTabInitialStateWithoutBookmarks, {
        type: types.BOOKMARK_REMOVED,
        payload: { url }
      })
      expect(spy).not.toBeCalled()
    })
  })
  describe('NEW_TAB_SITE_PINNED', () => {
    let spy: jest.SpyInstance
    beforeEach(() => {
      spy = jest.spyOn(gridAPI, 'calculateGridSites')
    })
    afterEach(() => {
      spy.mockRestore()
    })
    it('calls gridAPI.calculateGridSites', () => {
      jest.useFakeTimers()
      newTabReducer(fakeState, {
        type: types.NEW_TAB_SITE_PINNED,
        payload: { url }
      })
      jest.runAllTimers()
      expect(spy).toBeCalled()
      jest.useRealTimers()
    })
  })
  describe('NEW_TAB_SITE_UNPINNED', () => {
    let spy: jest.SpyInstance
    beforeEach(() => {
      spy = jest.spyOn(gridAPI, 'calculateGridSites')
    })
    afterEach(() => {
      spy.mockRestore()
    })
    it('calls gridAPI.calculateGridSites', () => {
      jest.useFakeTimers()
      newTabReducer(fakeState, {
        type: types.NEW_TAB_SITE_UNPINNED,
        payload: { url }
      })
      jest.runAllTimers()
      expect(spy).toBeCalled()
      jest.useRealTimers()
    })
  })
  describe('NEW_TAB_SITE_IGNORED', () => {
    let spy: jest.SpyInstance
    beforeEach(() => {
      spy = jest.spyOn(gridAPI, 'calculateGridSites')
    })
    afterEach(() => {
      spy.mockRestore()
    })
    it('calls gridAPI.calculateGridSites', () => {
      jest.useFakeTimers()
      newTabReducer(fakeState, {
        type: types.NEW_TAB_SITE_IGNORED,
        payload: { url }
      })
      jest.runAllTimers()
      expect(spy).toBeCalled()
      jest.useRealTimers()
    })
  })
  describe('NEW_TAB_UNDO_SITE_IGNORED', () => {
    let spy: jest.SpyInstance
    beforeEach(() => {
      spy = jest.spyOn(gridAPI, 'calculateGridSites')
    })
    afterEach(() => {
      spy.mockRestore()
    })
    it('calls gridAPI.calculateGridSites', () => {
      jest.useFakeTimers()
      newTabReducer(fakeState, {
        type: types.NEW_TAB_UNDO_SITE_IGNORED,
        payload: { url }
      })
      jest.runAllTimers()
      expect(spy).toBeCalled()
      jest.useRealTimers()
    })
  })
  describe('NEW_TAB_UNDO_ALL_SITE_IGNORED', () => {
    let spy: jest.SpyInstance
    beforeEach(() => {
      spy = jest.spyOn(gridAPI, 'calculateGridSites')
    })
    afterEach(() => {
      spy.mockRestore()
    })
    it('calls gridAPI.calculateGridSites', () => {
      jest.useFakeTimers()
      newTabReducer(fakeState, {
        type: types.NEW_TAB_UNDO_ALL_SITE_IGNORED
      })
      jest.runAllTimers()
      expect(spy).toBeCalled()
    })
    jest.useRealTimers()
  })
  describe('NEW_TAB_HIDE_SITE_REMOVAL_NOTIFICATION', () => {
    it('set showSiteRemovalNotification to false', () => {
      const assertion = newTabReducer(fakeState, {
        type: types.NEW_TAB_HIDE_SITE_REMOVAL_NOTIFICATION
      })
      expect(assertion).toEqual({
        ...fakeState,
        showSiteRemovalNotification: false
      })
    })
  })
  describe('NEW_TAB_SITE_DRAGGED', () => {
    let spy: jest.SpyInstance
    beforeEach(() => {
      spy = jest.spyOn(dndAPI, 'onDraggedSite')
    })
    afterEach(() => {
      spy.mockRestore()
    })
    it('calls dndAPI.onDraggedSite', () => {
      newTabReducer(fakeState, {
        type: types.NEW_TAB_SITE_DRAGGED,
        payload: {
          fromUrl: 'https://brave.com',
          toUrl: 'https://github.com'
        }
      })
      expect(spy).toBeCalled()
    })
  })
  describe('NEW_TAB_SITE_DRAG_END', () => {
    let spy: jest.SpyInstance
    beforeEach(() => {
      spy = jest.spyOn(dndAPI, 'onDragEnd')
    })
    afterEach(() => {
      spy.mockRestore()
    })
    it('calls dndAPI.onDragEnd', () => {
      newTabReducer(fakeState, {
        type: types.NEW_TAB_SITE_DRAG_END
      })
      expect(spy).toBeCalled()
    })
  })
  describe('NEW_TAB_BOOKMARK_INFO_AVAILABLE', () => {
    let spy: jest.SpyInstance
    beforeEach(() => {
      spy = jest.spyOn(bookmarksAPI, 'updateBookmarkInfo')
    })
    afterEach(() => {
      spy.mockRestore()
    })
    it('calls bookmarksAPI.updateBookmarkInfo', () => {
      const queryUrl: string = 'https://brave.com'
      const bookmarkTreeNode = {
        dateAdded: 1557899510259,
        id: '7',
        index: 0,
        parentId: '2',
        title: 'Secure, Fast & Private Web Browser with Adblocker | Brave Browser',
        url: 'http://brave.com/'
      }
      newTabReducer(fakeState, {
        type: types.NEW_TAB_BOOKMARK_INFO_AVAILABLE,
        payload: {
          queryUrl,
          bookmarkTreeNode
        }
      })
      expect(spy).toBeCalled()
    })
  })
  describe('NEW_TAB_GRID_SITES_UPDATED', () => {
    it('sets gridSites into gridSites state', () => {
      const url: string = 'http://brave.com/'
      const gridSites: Partial<NewTab.Sites> = [{ url }]
      const assertion = newTabReducer(fakeState, {
        type: types.NEW_TAB_GRID_SITES_UPDATED,
        payload: { gridSites }
      })
      expect(assertion).toEqual({
        ...fakeState,
        gridSites: [ { url: 'http://brave.com/' } ]
      })
    })
  })
  describe('CONNECT_TO_BINANCE', () => {
    it('resets any invalid cred message and sets state to in progress', () => {
      const assertion = newTabReducer(fakeState, {
        type: types.CONNECT_TO_BINANCE,
        payload: {}
      })

      expect(assertion).toEqual({
        ...fakeState,
        binanceState: {
          ...fakeState.binanceState,
          authInProgress: true,
          apiCredsInvalid: false
        }
      })
    })
  })
  describe('SET_HIDE_BALANCE', () => {
    it('sets attribute to payload (true)', () => {
      const assertion = newTabReducer(fakeState, {
        type: types.SET_HIDE_BALANCE,
        payload: {
          hide: true
        }
      })

      expect(assertion).toEqual({
        ...fakeState,
        binanceState: {
          ...fakeState.binanceState,
          hideBalance: true
        }
      })
    })

    it('sets attribute to payload (false)', () => {
      const assertion = newTabReducer(fakeState, {
        type: types.SET_HIDE_BALANCE,
        payload: {
          hide: false
        }
      })

      expect(assertion).toEqual({
        ...fakeState,
        binanceState: {
          ...fakeState.binanceState,
          hideBalance: false
        }
      })
    })
  })
  describe('SET_API_KEYS', () => {
    let spy: jest.SpyInstance

    beforeEach(() => {
      spy = jest.spyOn(chrome.binance, 'setAPIKey')
    })

    afterEach(() => {
      spy.mockRestore()
    })

    it('resets any credential error and sets validation in progress, call set api key', () => {
      const assertion = newTabReducer(fakeState, {
        type: types.SET_API_KEYS,
        payload: {
          apiKey: 'testApiKey',
          secretKey: 'testApiSecret'
        }
      })

      expect(assertion).toEqual({
        ...fakeState,
        binanceState: {
          ...fakeState.binanceState,
          apiCredError: false,
          validationInProgress: true
        }
      })

      expect(spy).toBeCalledWith('testApiKey', 'testApiSecret')
    })
  })
  describe('ON_BINANCE_BALANCES', () => {
    it('sets received balance', () => {
      const assertion = newTabReducer(fakeState, {
        type: types.ON_BINANCE_BALANCES,
        payload: {
          balances: {
            'BTC': '3.14'
          }
        }
      })

      expect(assertion).toEqual({
        ...fakeState,
        binanceState: {
          ...fakeState.binanceState,
          accountBalances: {
            'BTC': '3.14'
          }
        }
      })
    })
  })
  describe('ON_BINANCE_USER_TLD', () => {
    it('sets received tld', () => {
      const assertion = newTabReducer(fakeState, {
        type: types.ON_BINANCE_USER_TLD,
        payload: {
          userTLD: 'us'
        }
      })

      expect(assertion).toEqual({
        ...fakeState,
        binanceState: {
          ...fakeState.binanceState,
          userTLD: 'us'
        }
      })
    })
  })
  describe('ON_API_CREDS_ERROR', () => {
    it('sets indicator for a credential and ends validation process', () => {
      const assertion = newTabReducer(fakeState, {
        type: types.ON_API_CREDS_ERROR,
        payload: {}
      })

      expect(assertion).toEqual({
        ...fakeState,
        binanceState: {
          ...fakeState.binanceState,
          apiCredError: true,
          validationInProgress: false
        }
      })
    })
  })
  describe('ON_VALID_API_CREDS', () => {
    it('sets user authed and ends all validation processes', () => {
      const assertion = newTabReducer(fakeState, {
        type: types.ON_VALID_API_CREDS,
        payload: {}
      })

      expect(assertion).toEqual({
        ...fakeState,
        binanceState: {
          ...fakeState.binanceState,
          userAuthed: true,
          authInProgress: false,
          validationInProgress: false
        }
      })
    })
  })
  describe('ON_BTC_USD_PRICE', () => {
    it('handles "-" account case', () => {
      fakeState.binanceState.accountBalances = {
        'BTC': '-'
      }
      const assertion = newTabReducer(fakeState, {
        type: types.ON_BTC_USD_PRICE,
        payload: {
          price: '7154.99000000'
        }
      })

      expect(assertion).toEqual({
        ...fakeState,
        binanceState: {
          ...fakeState.binanceState,
          btcBalanceValue: '0.00'
        }
      })
    })

    it('handles default "0.00" account case', () => {
      const assertion = newTabReducer(fakeState, {
        type: types.ON_BTC_USD_PRICE,
        payload: {
          price: '7154.99000000'
        }
      })

      expect(assertion).toEqual({
        ...fakeState,
        binanceState: {
          ...fakeState.binanceState,
          btcBalanceValue: '0.00'
        }
      })
    })

    it('properly calculates BTC USD Price', () => {
      fakeState.binanceState.accountBalances = {
        'BTC': '3.14'
      }
      const assertion = newTabReducer(fakeState, {
        type: types.ON_BTC_USD_PRICE,
        payload: {
          price: '7154.99000000'
        }
      })

      expect(assertion).toEqual({
        ...fakeState,
        binanceState: {
          ...fakeState.binanceState,
          btcBalanceValue: '22466.67'
        }
      })
    })
  })
  describe('DISCONNECT_BINANCE', () => {
    let spy: jest.SpyInstance

    beforeEach(() => {
      spy = jest.spyOn(chrome.binance, 'setAPIKey')
    })

    afterEach(() => {
      spy.mockRestore()
    })

    it('resets binance state to default storage value, resets api keys', () => {
      const assertion = newTabReducer(fakeState, {
        type: types.DISCONNECT_BINANCE,
        payload: {}
      })

      expect(assertion).toEqual({
        ...fakeState,
        binanceState: {
          ...fakeState.binanceState,
          ...storage.defaultState.binanceState
        }
      })
      expect(spy).toBeCalledWith('', '')
    })
  })
  describe('ON_API_KEYS_INVALID', () => {
    it('sets invalid creds attribute to true', () => {
      const assertion = newTabReducer(fakeState, {
        type: types.ON_API_KEYS_INVALID,
        payload: {}
      })

      expect(assertion).toEqual({
        ...fakeState,
        binanceState: {
          ...fakeState.binanceState,
          apiCredsInvalid: true
        }
      })
    })
  })
})
