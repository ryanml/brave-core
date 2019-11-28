/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import styled from 'styled-components'

interface StyleProps {
  hideBalance: boolean
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
  font-size: 13px;
  max-width: 240px;
  margin-top: 12px;
  margin-bottom: 25px;
  color: rgba(255, 255, 255, 0.7);
`

export const ApiCopy = styled(Copy)`
  max-width: 190px;
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
  background: #fff;
  width: 20px;
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
  border-left: solid #fff;
  color: #000;

  &:focus {
    outline: 0;
  }
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
