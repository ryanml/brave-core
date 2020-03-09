/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import styled from 'styled-components'

interface StyleProps {
  active?: boolean
  isBTC?: boolean
  isAsset?: boolean
  isBuy?: boolean
  isSmall?: boolean
  isLast?: boolean
  isActive?: boolean
  hideBalance?: boolean
  itemsShowing?: boolean
  position?: 'left' | 'right'
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
  min-width: 255px;
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

export const ConnectButton = styled<StyleProps, 'button'>('button')`
  font-size: 16px;
  font-weight: bold;
  border-radius: 20px;
  width: ${p => p.isSmall ? 50 : 100}%;
  background: #D9B227;
  border: 0;
  padding: 10px 0;
  cursor: pointer;
  color: #000;
  margin-bottom: 10px;
`

export const DismissAction = styled<{}, 'span'>('span')`
  display: block;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-top: 8px;
  font-weight: bold;
`

export const EquityTitle = styled<{}, 'span'>('span')`
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  vertical-align: middle;
`

export const Balance = styled<StyleProps, 'span'>('span')`
  display: block;
  font-size: ${p => p.isBTC ? '25' : '14'}px;
  font-weight bold;
  margin: 5px 0;
  color: #fff;
  text-align: ${p => p.isBTC ? 'unset' : 'right'};
  margin-right: ${p => p.isBTC ? '0' : '7'};
  -webkit-filter: blur(${p => p.hideBalance ? 10 : 0}px);
`

export const TickerLabel = styled<{}, 'span'>('span')`
  font-size: 14px;
  font-weight bold;
  color: #fff;
`

export const Converted = styled<StyleProps, 'span'>('span')`
  display: block;
  font-size: ${p => p.isBTC ? '16' : '14'}px;
  color: rgba(70, 70, 70);
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
  margin-left: 60%;
  margin-top: 25%;
  cursor: pointer;
  color: rgb(70, 70, 70);
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
  padding-top: 35px;
  min-height: 250px;
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
  min-width: 255px;
`

export const BuyPromptWrapper = styled<{}, 'div'>('div')`
  margin-bottom: 15px;
`

export const FiatInputWrapper = styled<{}, 'div'>('div')`
  height: 30px;
  border: 1px solid rgb(70, 70, 70);
  margin-bottom: 10px;
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

export const NavigationBar = styled<{}, 'div'>('div')`
  height: 30px;
`

export const NavigationItem = styled<StyleProps, 'div'>('div')`
  float: left;
  width: 25%;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  text-align: center;
  color: ${p => p.isActive ? '#F2C101' : '#9D7B01'};
`

export const SelectedView = styled<{}, 'div'>('div')`
  border: 1px solid rgb(70, 70, 70);
  overflow-y: scroll;
  height: 170px;
  width: 235px;
  margin-left: 4px;
`

export const ListItem = styled<{}, 'div'>('div')`
  border-bottom: 1px solid rgb(70, 70, 70);
  padding: 10px 5px;
  overflow: auto;
`

export const ListIcon = styled<{}, 'div'>('div')`
  float: left;
  margin-top: -2px;
  margin-right: 10px;
`

export const ListImg = styled<{}, 'img'>('img')`
  width: 28px;
`

export const ListLabel = styled<{}, 'div'>('div')`
  color: #fff;
  cursor: pointer;
  margin-top: 5px;
`

export const SearchInput = styled<{}, 'input'>('input')`
  border: none;
  color: #fff;
  background: inherit;
  font-size: 15px;
  &:focus {
    outline: 0;
  }
`

export const DetailIcons = styled<{}, 'div'>('div')`
  float: left;
  margin-top: -3px;
  margin-right: 10px;
`

export const AssetTicker = styled<{}, 'span'>('span')`
  color: #fff;
  font-weight: bold;
  margin-right: 3px;
  font-size: 15px;
`

export const AssetLabel = styled<{}, 'span'>('span')`
  color: rgb(70, 70, 70);
  display: inline-block;
  font-weight: bold;
  font-size: 15px;
`

export const AssetQR = styled<{}, 'div'>('div')`
  float: right;
  margin-top: -3px;
`

export const DetailArea = styled<{}, 'div'>('div')`
  padding: 5px;
  font-weight: bold;
`

export const MemoArea = styled<{}, 'div'>('div')`
  padding: 5px;
`

export const MemoInfo = styled<{}, 'div'>('div')`
  float: left;
  max-width: 110px;
`

export const CopyButton = styled(GenButton)`
  float: right;
`

export const DetailLabel = styled<{}, 'span'>('span')`
  color: rgb(70, 70, 70);
  font-weight: bold;
  display: block;
  font-size: 15px;
  margin-bottom: 5px;
`

export const DetailInfo = styled<{}, 'span'>('span')`
  color: #fff;
  font-weight: bold;
  display: block;
  font-size: 15px;
  margin-bottom: 10px;
  width: 180px;
  word-wrap: break-word;
`

export const BackArrow = styled<{}, 'div'>('div')`
  width: 20px;
  float: left;
  cursor: pointer;
  margin-right: 5px;
`

export const ListInfo = styled<StyleProps, 'div'>('div')`
  float: ${p => `${p.position}`};
  min-width: 83px;
  font-size: ${p => p.isAsset ? '16px': 'inherit'};
  margin-top: ${p => p.isAsset ? '4': '0'}px;

  ${p => {
    if (p.position === 'right') {
      return `
        width: 40%;
        text-align: left;
      `
    } else {
      return null
    }
  }}
`

export const TradeLabel = styled<{}, 'span'>('span')`
  font-weight: bold;
  font-size: 14px;
  display: block;
  color: rgb(70, 70, 70);
  margin-bottom: 3px;
`

export const BTCValueLabel = styled(TradeLabel)`
  color: #6DD401;
`

export const OtherValueLabel = styled(TradeLabel)`
  color: #fff;
`

export const BTCSummary = styled(ListItem)`
  padding: 5px 7px;
`

export const BuySellHeader = styled<{}, 'div'>('div')`
  padding: 5px 0px;
  height: 45px;
  border-bottom: 1px solid rgb(70, 70, 70);
`

export const AssetInfo = styled<{}, 'div'>('div')`
  float: left;
  color: #fff;
  text-align: left;
`

export const PairName = styled<{}, 'span'>('span')`
  font-weight: bold;
  font-size: 14px;
  display: block;
`

export const PairPrice = styled<{}, 'span'>('span')`
  font-size: 12px;
  display: block;
`

export const BuySellToggle = styled<{}, 'div'>('div')`
  float: right;
`

export const Switch = styled<StyleProps, 'div'>('div')`
  font-size: 14px;
  font-weight: bold;
  display: inline-block;
  border-radius: 8px;
  padding: ${p => p.active ? '7' : '6'}px 10px;
  background: ${p => p.active ? '#D9B227' : '#000'};
`

export const ActionLabel = styled<{}, 'span'>('span')`
  color: rgb(70, 70, 70);
  display: block;
  padding: 5px 0px;
  font-weight: bold;
`

export const BuySellContent = styled<{}, 'div'>('div')`
  padding: 5px 0px;
  text-align: center;
  min-width: 240px;
`

export const AmountInput = styled<{}, 'div'>('div')`

`

export const AmountButton = styled<{}, 'button'>('button')`
  font-size: 16px;
  font-weight: bold;
  border-radius: 4px;
  border: 0;
  padding: 5px;
  cursor: pointer;
  background: #2C2C2B;
  color: #fff;
  width: 13%;
  height: 30px;
  display: inline-block;
`

export const AmountTextInput = styled(InputField)`
  min-width: unset;
  vertical-align: unset;
  width: 65%;
  margin: 0px 5px;
  color: #fff;
  border-left: 1px solid rgb(70, 70, 70);
`

export const PercentWrapper = styled<{}, 'div'>('div')`
  margin: 10px 0px;
`

export const Percent = styled<{}, 'div'>('div')`
  padding: 2px 5px;
  color: #fff;
  border: 1px solid rgb(70, 70, 70);
  margin-right: 1px;
  border-radius: 3px;
  cursor: pointer;
  display: inline-block;
`

export const BuySellButton = styled(ConnectButton)`
  padding: 5px;
  margin: 5px 0px;
  background: ${p => p.isBuy ? '#3BB260': '#DD5353'};
`

export const AvailableLabel = styled<{}, 'span'>('span')`
  float: right;
  margin-top: -27px;
  font-size: 13px;
`

export const ConvertInfoWrapper = styled<StyleProps, 'div'>('div')`
  margin: 10px 0;
  overflow-y: auto;
`

export const ConvertInfoItem = styled<StyleProps, 'div'>('div')`
  margin: 5px 0;
  overflow-y: auto;
  margin-top: ${p => p.isLast? '15' : '5'}px;
`

export const ConvertLabel = styled<{}, 'span'>('span')`
  float: left;
  width: 45%;
  text-align: left;
  font-size: 15px;
`

export const ConvertValue = styled<{}, 'span'>('span')`
  font-weight: bold;
  float: right;
  width: 55%;
  text-align: right;
  font-size: 15px;
`

export const StyledEmoji = styled<{}, 'div'>('div')`
  margin: 10px 0px;
`
