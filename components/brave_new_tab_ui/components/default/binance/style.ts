/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import styled from 'styled-components'

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
  margin-top: 5px;
  margin-bottom: 15px;
  color: rgba(255, 255, 255, 0.7);
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
`

export const Balance = styled<{}, 'span'>('span')`
  display: block;
  font-size: 30px;
  font-weight bold;
  margin: 10px 0;
`

export const TickerLabel = styled<{}, 'span'>('span')`
  font-size: 14px;
  font-weight bold;
`

export const Converted = styled<{}, 'span'>('span')`
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
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
