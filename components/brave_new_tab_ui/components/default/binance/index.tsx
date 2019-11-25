/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'

import {
  Header,
  Content,
  Title,
  Copy,
  ApiCopy,
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
  ActionIcon,
  BlurIcon,
  InputWrapper,
  InputItem,
  InputIcon,
  InputIconWrapper,
  InputField,
  GenButtonWrapper,
  GenButton
} from './style'
import {
  HideIcon,
  ShowIcon,
  TradeIcon,
  BinanceLogo,
  DepositIcon,
  ApiKeyIcon,
  SecretKeyIcon
} from './assets/icons'

import createWidget from '../widget/index'
import { getLocale } from '../../../../common/locale'

interface State {
  apiKey: string
  apiSecret: string
}

interface Props {
  userAuthed: boolean
  btcBalance: string
  authInProgress: boolean
  hideBalance: boolean
  hideWidget: () => void
  connectBinance: () => void
  onBinanceDetails: () => void
  onBinanceDeposit: () => void
  onBinanceTrade: () => void
  onSetHideBalance: (hide: boolean) => void
  onGenerateNewKey: () => void
  onBinanceConnected: () => void
}

class Binance extends React.PureComponent<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {
      apiKey: '',
      apiSecret: ''
    }
  }

  renderRoutes = () => {
    const { userAuthed, authInProgress } = this.props

    if (authInProgress) {
      return this.renderApiKeyEntry()
    }

    if (userAuthed) {
      return this.renderAccountView()
    }

    return this.renderWelcomeView()
  }

  onSetHideBalance = () => {
    this.props.onSetHideBalance(
      !this.props.hideBalance
    )
  }

  onKeySubmit = (field: string, event: any) => {
    const fieldValue = event.target.value

    // const { onBinanceConnected } = this.props
    const { apiKey, apiSecret } = this.state

    if (!fieldValue.length) {
      return
    }

    this.setState({
      ...this.state,
      [field]: fieldValue
    })

    if ((field === 'apiKey' && apiSecret.length) ||
        (field === 'apiSecret' && apiKey.length)) {
      console.log('Submitting credentials to binance service')
      /*
      chrome.binanceWidget.setAPIKey(apiKey, apiSecret, (success) => {
        if (success) {
          onBinanceConnected()
        }
      })
      */
    }
  }

  renderApiKeyEntry = () => {
    const { onGenerateNewKey } = this.props

    return (
      <>
        <ApiCopy>
          {getLocale('binanceWidgetApiKeyDesc')} <Link target={'_blank'} href={'https://www.binance.com/en/support/articles/360002502072'}>{getLocale('binanceWidgetApiKeyHelp')}</Link>
        </ApiCopy>
        <InputWrapper>
          <InputItem>
            <InputIconWrapper>
              <InputIcon>
                <ApiKeyIcon />
              </InputIcon>
            </InputIconWrapper>
            <InputField
              type={'text'}
              onChange={this.onKeySubmit.bind(this, 'apiKey')}
              placeholder={getLocale('binanceWidgetApiKeyInput')}
            />
          </InputItem>
          <InputItem>
            <InputIconWrapper>
              <InputIcon>
                <SecretKeyIcon />
              </InputIcon>
            </InputIconWrapper>
            <InputField
              type={'text'}
              onChange={this.onKeySubmit.bind(this, 'apiSecret')}
              placeholder={getLocale('binanceWidgetApiSecretKeyInput')}
            />
          </InputItem>
        </InputWrapper>
        <GenButtonWrapper>
          <GenButton onClick={onGenerateNewKey}>
            {getLocale('binanceWidgetGenNewKey')}
          </GenButton>
        </GenButtonWrapper>
      </>
    )
  }

  renderAccountView = () => {
    const {
      btcBalance,
      hideBalance,
      onBinanceDetails,
      onBinanceDeposit,
      onBinanceTrade
    } = this.props

    return (
      <>
        <EquityTitle>
          {getLocale('binanceWidgetValueText')}
          <BlurIcon onClick={this.onSetHideBalance}>
            {
              hideBalance
              ? <ShowIcon />
              : <HideIcon />
            }
          </BlurIcon>
        </EquityTitle>
        <Balance hideBalance={hideBalance}>
          {btcBalance} <TickerLabel>{getLocale('binanceWidgetBTCTickerText')}</TickerLabel>
        </Balance>
        <Converted hideBalance={hideBalance}>
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
