/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import styled from 'styled-components'

interface StyleProps {
  isLast?: boolean
  hideBalance?: boolean
  itemsShowing?: boolean
}

export const WidgetWrapper = styled<{}, 'div'>('div')`
  color: white;
  padding: 10px 15px;
  border-radius: 6px;
  position: relative;
  font-family: Muli, sans-serif;
  overflow-x: hidden;
  background-image: linear-gradient(140deg, #1F2327 0%, #000000 100%);
`

export const Header = styled<{}, 'div'>('div')`
  margin-top: 10px;
  text-align: left;
`

export const Content = styled<{}, 'div'>('div')`
  margin: 10px 0;
  min-width: 240px;
`

export const Title = styled<{}, 'span'>('span')`
  display: block;
  font-size: 13px;
  font-weight: bold;
`

export const Link = styled<{}, 'a'>('a')`
  color: #F0B90B;
  text-decoration: none;
`

export const Copy = styled<{}, 'p'>('p')`
  font-size: 15px;
  max-width: 240px;
  margin-top: 20px;
  margin-bottom: 11px;
`

export const ApiCopy = styled(Copy)`
  max-width: 215px;
  line-height: 17px;
  margin-bottom: 10px;
  margin-top: 5px;
`

export const Error = styled<{}, 'div'>('div')`
  font-size: 13px;
  font-weight: bold;
  margin: 5px 0 10px 0;
  color: #FF7316;
  height: 12px;
`

export const ActionsWrapper = styled<{}, 'div'>('div')`
  margin-bottom: 15px;
  text-align: center;
`

export const ConnectButton = styled<{}, 'button'>('button')`
  font-size: 16px;
  font-weight: bold;
  border-radius: 20px;
  width: 100%;
  background: #D9B227;
  border: 0;
  padding: 10px 0;
  cursor: pointer;
  margin-bottom: 10px;
`

export const DismissAction = styled<{}, 'span'>('span')`
  display: block;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  margin-top: 10px;
`

export const EquityTitle = styled<{}, 'span'>('span')`
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  vertical-align: middle;
`

export const Balance = styled<StyleProps, 'span'>('span')`
  display: block;
  font-size: 30px;
  font-weight bold;
  margin: 10px 0;
  -webkit-filter: blur(${p => p.hideBalance ? 10 : 0}px);
`

export const TickerLabel = styled<{}, 'span'>('span')`
  font-size: 14px;
  font-weight bold;
`

export const Converted = styled<StyleProps, 'span'>('span')`
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  -webkit-filter: blur(${p => p.hideBalance ? 10 : 0}px);
`

export const DetailsAction = styled<{}, 'span'>('span')`
  font-size: 13px;
  cursor: pointer;
  margin-top: 15px;
  display: block;
`

export const ActionsGroup = styled<{}, 'div'>('div')`
  margin: 15px 0;

  > *:nth-child(1) {
    margin-right: 7px;
  }
`

export const ActionIcon = styled<{}, 'div'>('div')`
  padding: 0 5px;
  display: inline-block;
  vertical-align: text-top;
`

export const AccountAction = styled<{}, 'div'>('div')`
  background: #000;
  color: #F0B90B;
  border: 1px solid #F0B90B;
  cursor: pointer;
  width: 90x;
  padding: 5px 7px;
  display: inline-block;
  height: 31px;
`

export const BlurIcon = styled<{}, 'div'>('div')`
  display: inline-block;
  vertical-align: middle;
  margin-left: 10px;
  cursor: pointer;
`

export const InputWrapper = styled<{}, 'div'>('div')`
`

export const InputItem = styled<{}, 'div'>('div')`
  margin-bottom: 10px;
`

export const InputIconWrapper = styled<{}, 'div'>('div')`
  display: inline-block;
  height: 30px;
  background: #000;
  width: 20px;
  border: 1px solid rgb(70, 70, 70);
  border-right: none;
`

export const InputIcon = styled<{}, 'div'>('div')`
  padding: 8px 0px 0px 5px;
`

export const InputField = styled<{}, 'input'>('input')`
  display: inline-block;
  min-width: 215px;
  height: 30px;
  vertical-align: top;
  border: none;
  color: rgb(70, 70, 70);
  background: #000;
  border: 1px solid rgb(70, 70, 70);
  border-left: none;
  padding-left: 5px;

  &:focus {
    outline: 0;
  }
`

export const FiatInputField = styled(InputField)`
  color: #fff;
  border-top: none;
  border-left: none;
  border-right: 1px solid rgb(70, 70, 70);
  width: 75%;
  min-width: unset;
  border-left: none;
  padding-left: 10px;
  height: 29px;
  border-bottom: 1px solid rgb(70, 70, 70);;
`

export const GenButtonWrapper = styled<{}, 'div'>('div')`
  margin-top: 10px;
  height: 24px;
`

export const Validation = styled<{}, 'div'>('div')`
  font-weight: bold;
`

export const Spinner = styled<{}, 'div'>('div')`
  color: #fff;
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-left: 5px;
`

export const GenButton = styled<{}, 'button'>('button')`
  font-size: 13px;
  font-weight: bold;
  border-radius: 20px;
  border: 0;
  padding: 5px 10px;
  cursor: pointer;
  background: #2C2C2B;
  color: rgba(255, 255, 255, 0.7);
`

export const ActionTray = styled<{}, 'div'>('div')`
  float: right;
  margin-top: 2px;
  display: inline-block;

  > *:nth-child(1) {
    margin-right: 20px;
  }
`

export const ActionItem = styled<{}, 'div'>('div')`
  cursor: pointer;
  display: inline-block;
  vertical-align: middle;
`

export const DisconnectWrapper = styled<{}, 'div'>('div')`
  padding-top: 25px;
  min-height: 226px;
  text-align: center;
  max-width: 240px;
`

export const DisconnectButton = styled(GenButton)`
  background: #AA1212;
  color: #fff;
  padding: 5px 20px;
`

export const DisconnectTitle = styled(Title)`
  font-size: 14px;
  max-width: 245px;
  margin: 0 auto;
  line-height: 18px;
`

export const DisconnectCopy = styled(Copy)`
  color: #fff;
  max-width: 220px;
  line-height: 17px;
  margin: 8px auto 15px auto;
`

export const InvalidTitle = styled(DisconnectTitle)`
  max-width: unset;
  margin-bottom: 20px;
`

export const InvalidCopy = styled(DisconnectCopy)`
  max-width: 210px;
`

export const InvalidWrapper = styled(DisconnectWrapper)`
  min-width: 240px;
`

export const BuyPromptWrapper = styled<{}, 'div'>('div')`
  margin-bottom: 15px;
`

export const FiatInputWrapper = styled<{}, 'div'>('div')`
  height: 30px;
  border: 1px solid rgb(70, 70, 70);
  margin-bottom: 15px;
`
export const FiatDropdown = styled<{}, 'div'>('div')`
  float: right;
  width: 25%;
  padding: 7px 3px 0px 7px;
`
export const FiatDropdownLabel = styled<{}, 'span'>('span')`
`
export const CaratDropdown = styled<{}, 'div'>('div')`
  width: 18px;
  height: 18px;
  float: right;
  margin-top: -2px;
  color: #fff;
`

export const AssetDropdown = styled<StyleProps, 'div'>('div')`
  height: 30px;
  background: #000;
  color: #fff;
  border: 1px solid rgb(70, 70, 70);
  padding: 7px 3px 0px 8px;
  cursor: pointer;
  border-bottom: ${p => p.itemsShowing ? 'none': '1px solid rgb(70, 70, 70)'};
`

export const AssetDropdownLabel = styled<{}, 'span'>('span')`
  float: left;
`

export const AssetItems = styled<{}, 'div'>('div')`
  background: #000;
  color: #fff;
  height: 100px;
  overflow-y: scroll;
  position: absolute;
  width: 240px;
  padding: 0px 8px;
  max-height: 75px;
  border: 1px solid rgb(70, 70, 70);
  border-top: none;
`

export const AssetItem = styled<StyleProps, 'div'>('div')`
  padding: 3px 0px;
  font-weight: bold;
  cursor: pointer;
  border-bottom: ${p => !p.isLast ? '1px solid rgb(70, 70, 70)' : ''};
`

export const ConnectPrompt = styled<{}, 'div'>('div')`
  float: right;
  margin-top: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
`
