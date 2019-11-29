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
  Error,
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
  GenButton,
  Validation,
  Spinner,
  ActionTray,
  ActionItem,
  DisconnectWrapper,
  DisconnectButton,
  DisconnectTitle,
  DisconnectCopy
} from './style'
import {
  HideIcon,
  ShowIcon,
  TradeIcon,
  BinanceLogo,
  DepositIcon,
  ApiKeyIcon,
  SecretKeyIcon,
  DisconnectIcon,
  RefreshIcon
} from './assets/icons'

import createWidget from '../widget/index'
import { getLocale } from '../../../../common/locale'
import { LoaderIcon } from 'brave-ui/components/icons'

interface State {
  apiKey: string
  apiSecret: string
  disconnectInProgress: boolean
}

interface Props {
  userAuthed: boolean
  btcBalance: string
  authInProgress: boolean
  hideBalance: boolean
  apiCredError: boolean
  btcBalanceValue: string
  validationInProgress: boolean
  hideWidget: () => void
  connectBinance: () => void
  onBinanceDetails: () => void
  onBinanceDeposit: () => void
  onBinanceTrade: () => void
  onSetHideBalance: (hide: boolean) => void
  onGenerateNewKey: () => void
  onBinanceBalance: (balance: string) => void
  onBinanceUserTLD: (userTLD: NewTab.BinanceTLD) => void
  onBTCUSDPrice: (value: string) => void
  onSetApiKeys: (apiKey: string, apiSecret: string) => void
  onDisconnectBinance: () => void
}

class Binance extends React.PureComponent<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {
      apiKey: '',
      apiSecret: '',
      disconnectInProgress: false
    }
  }

  componentDidMount () {
    if (this.props.userAuthed) {
      this.fetchBalance()
    }

    chrome.binance.getUserTLD((userTLD: NewTab.BinanceTLD) => {
      this.props.onBinanceUserTLD(userTLD)
    })
  }

  componentDidUpdate (prevProps: Props) {
    if (!prevProps.userAuthed && this.props.userAuthed) {
      this.fetchBalance()
    }

    if (!prevProps.apiCredError && this.props.apiCredError) {
      this.setState({
        apiKey: '',
        apiSecret: ''
      })
    }
  }

  fetchBalance = () => {
    chrome.binance.getAccountBalance((balance: string) => {
      this.props.onBinanceBalance(balance)

      chrome.binance.getTickerPrice('BTCUSDT', (price: string) => {
        this.props.onBTCUSDPrice(price)
      })
    })
  }

  disconnectBinance = () => {
    this.setState({
      disconnectInProgress: true
    })
  }

  cancelDisconnect = () => {
    this.setState({
      disconnectInProgress: false
    })
  }

  finishDisconnect = () => {
    this.props.onDisconnectBinance()
    this.cancelDisconnect()
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

    if (!fieldValue.length) {
      return
    }

    const newState = {
      ...this.state,
      [field]: fieldValue
    }
    const { apiKey, apiSecret } = newState

    if (apiKey.length && apiSecret.length) {
      this.props.onSetApiKeys(apiKey, apiSecret)
    }

    this.setState(newState)
  }

  renderDisconnectView = () => {
    return (
      <DisconnectWrapper>
        <DisconnectTitle>
          {getLocale('binanceWidgetDisconnectTitle')}
        </DisconnectTitle>
        <DisconnectCopy>
          {getLocale('binanceWidgetDisconnectText')}
        </DisconnectCopy>
        <DisconnectButton onClick={this.finishDisconnect}>
          {getLocale('binanceWidgetDisconnectButton')}
        </DisconnectButton>
        <DismissAction onClick={this.cancelDisconnect}>
          {getLocale('binanceWidgetCancelText')}
        </DismissAction>
      </DisconnectWrapper>
    )
  }

  renderApiKeyEntry = () => {
    const {
      apiCredError,
      onGenerateNewKey,
      validationInProgress
    } = this.props

    return (
      <>
        <ApiCopy>
          {getLocale('binanceWidgetApiKeyDesc')} <Link target={'_blank'} href={'https://www.binance.com/en/support/articles/360002502072'}>{getLocale('binanceWidgetApiKeyHelp')}</Link>
        </ApiCopy>
        <Error>
          {
            apiCredError
            ? getLocale('binanceWidgetInvalidEntry')
            : null
          }
        </Error>
        <InputWrapper>
          <InputItem>
            <InputIconWrapper>
              <InputIcon>
                <ApiKeyIcon />
              </InputIcon>
            </InputIconWrapper>
            <InputField
              type={'password'}
              value={this.state.apiKey}
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
              type={'password'}
              value={this.state.apiSecret}
              onChange={this.onKeySubmit.bind(this, 'apiSecret')}
              placeholder={getLocale('binanceWidgetApiSecretKeyInput')}
            />
          </InputItem>
        </InputWrapper>
        <GenButtonWrapper>
          {
            validationInProgress
            ? <Validation>
                {getLocale('binanceWidgetValidatingCreds')} <Spinner><LoaderIcon /></Spinner>
              </Validation>
            : <GenButton onClick={onGenerateNewKey}>
                {getLocale('binanceWidgetGenNewKey')}
              </GenButton>
          }
        </GenButtonWrapper>
      </>
    )
  }

  renderAccountView = () => {
    const {
      btcBalance,
      hideBalance,
      btcBalanceValue,
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
          {`= $${btcBalanceValue}`}
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
    const { userAuthed } = this.props

    if (this.state.disconnectInProgress) {
      return (
        <WidgetWrapper>
          {this.renderDisconnectView()}
        </WidgetWrapper>
      )
    }

    return (
      <WidgetWrapper>
        <Header>
          <BinanceLogo />
          {
            userAuthed
            ? <ActionTray>
                <ActionItem onClick={this.fetchBalance}>
                  <RefreshIcon />
                </ActionItem>
                <ActionItem onClick={this.disconnectBinance}>
                  <DisconnectIcon />
                </ActionItem>
              </ActionTray>
            : null
          }
        </Header>
        <Content>
          {this.renderRoutes()}
        </Content>
      </WidgetWrapper>
    )
  }
}

export const BinanceWidget = createWidget(Binance)
