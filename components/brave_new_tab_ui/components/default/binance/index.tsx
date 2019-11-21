/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'

import {
  Header,
  Content,
  Title,
  Copy,
  Link,
  ActionsWrapper,
  ConnectButton,
  DismissAction,
  WidgetWrapper,
  EquityTitle,
  Balance,
  TickerLabel,
  Converted,
  DetailsAction,
  ActionsGroup,
  AccountAction,
  ActionIcon
} from './style'
import createWidget from '../widget/index'
import BinanceLogo from './assets/binance-logo'
import TradeIcon from './assets/trade-icon'
import DepositIcon from './assets/deposit-icon'
import { getLocale } from '../../../../common/locale'

interface Props {
  userAuthed: boolean
  btcBalance: string
  authInProgress: boolean
  hideWidget: () => void
  connectBinance: () => void
  onBinanceDetails: () => void
  onBinanceDeposit: () => void
  onBinanceTrade: () => void
}

class Binance extends React.PureComponent<Props, {}> {

  renderRoutes = () => {
    const { userAuthed, authInProgress } = this.props

    if (authInProgress) {
      return this.renderAuthInProgress()
    }

    if (userAuthed) {
      return this.renderAccountView()
    }

    return this.renderWelcomeView()
  }

  renderAuthInProgress = () => {
    return (
      <>
        <Copy>
          {getLocale('binanceWidgetConnectingOne')} <Link target={'_blank'} href={'https://www.binance.us/en/login'}>binance.us</Link> {getLocale('binanceWidgetConnectingTwo')}
        </Copy>
      </>
    )
  }

  renderAccountView = () => {
    const {
      btcBalance,
      onBinanceDetails,
      onBinanceDeposit,
      onBinanceTrade
    } = this.props

    return (
      <>
        <EquityTitle>
          {getLocale('binanceWidgetValueText')}
        </EquityTitle>
        <Balance>
          {btcBalance} <TickerLabel>{getLocale('binanceWidgetBTCTickerText')}</TickerLabel>
        </Balance>
        <Converted>
          {'= $0.00'}
        </Converted>
        <DetailsAction onClick={onBinanceDetails}>
          {getLocale('binanceWidgetViewDetails')}
        </DetailsAction>
        <ActionsGroup>
          <AccountAction onClick={onBinanceDeposit}>
            <ActionIcon>
              <DepositIcon />
            </ActionIcon>
            {getLocale('binanceWidgetDepositLabel')}
          </AccountAction>
          <AccountAction onClick={onBinanceTrade}>
            <ActionIcon>
              <TradeIcon />
            </ActionIcon>
            {getLocale('binanceWidgetTradeLabel')}
          </AccountAction>
        </ActionsGroup>
      </>
    )
  }

  renderWelcomeView = () => {
    const { connectBinance, hideWidget } = this.props

    return (
      <>
        <Title>
          {getLocale('binanceWidgetWelcomeTitle')}
        </Title>
        <Copy>
          {getLocale('binanceWidgetSubText')}
        </Copy>
        <ActionsWrapper>
          <ConnectButton onClick={connectBinance}>
            {getLocale('binanceWidgetConnectText')}
          </ConnectButton>
          <DismissAction onClick={hideWidget}>
            {getLocale('binanceWidgetDismissText')}
          </DismissAction>
        </ActionsWrapper>
      </>
    )
  }

  render () {
    return (
      <WidgetWrapper>
        <Header>
          <BinanceLogo />
        </Header>
        <Content>
          {this.renderRoutes()}
        </Content>
      </WidgetWrapper>
    )
  }
}

export const BinanceWidget = createWidget(Binance)
