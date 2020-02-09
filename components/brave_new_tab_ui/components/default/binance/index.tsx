/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'

import {
  Header,
  Content,
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
  DisconnectCopy,
  InvalidTitle,
  InvalidCopy,
  InvalidWrapper,
  BuyPromptWrapper,
  FiatDropdown,
  FiatDropdownLabel,
  FiatInputWrapper,
  CaratDropdown,
  AssetDropdown,
  AssetDropdownLabel,
  ConnectPrompt,
  AssetItems,
  AssetItem,
  FiatInputField
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
import { CaratDownIcon, LoaderIcon } from 'brave-ui/components/icons'

interface State {
  apiKey: string
  apiSecret: string
  disconnectInProgress: boolean
  initialAsset: string,
  initialAmount: string,
  currenciesShowing: boolean
}

interface Props {
  userAuthed: boolean
  authInProgress: boolean
  hideBalance: boolean
  apiCredError: boolean
  btcBalanceValue: string
  validationInProgress: boolean
  apiCredsInvalid: boolean
  accountBalances: Record<string, string>
  connectBinance: () => void
  onBuyCrypto: () => void
  onBinanceDetails: () => void
  onBinanceDeposit: () => void
  onBinanceTrade: () => void
  onSetHideBalance: (hide: boolean) => void
  onGenerateNewKey: () => void
  onBinanceBalances: (balances: Record<string, string>) => void
  onBinanceUserTLD: (userTLD: NewTab.BinanceTLD) => void
  onBTCUSDPrice: (value: string) => void
  onAssetBTCPrice: (ticker: string, price: string) => void
  onSetApiKeys: (apiKey: string, apiSecret: string) => void
  onApiKeysInvalid: () => void
  onDisconnectBinance: () => void
}

class Binance extends React.PureComponent<Props, State> {
  private currencies: string[]

  constructor (props: Props) {
    super(props)
    this.state = {
      apiKey: '',
      apiSecret: '',
      disconnectInProgress: false,
      initialAsset: 'BTC',
      initialAmount: '',
      currenciesShowing: false
    }
    this.currencies = [
      'BTC',
      'ETH',
      'XRP',
      'BNB',
      'BCH',
      'BUSD'      
    ]
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
    chrome.binance.getAccountBalance((balances: Record<string, string>, unauthorized: boolean) => {
      /*
      if (unauthorized) {
        this.props.onApiKeysInvalid()
        return
      }
      */

      balances = {
        'BTC': '0.3255002',
        'ETH': '2.5696903',
        'XRP': '0.0000000',
        'BNB': '0.0000000',
        'BCH': '0.0000000',
        'BUSD': '0.0000000'
      }

      this.props.onBinanceBalances(balances)

      chrome.binance.getTickerPrice('BTCUSDT', (price: string) => {
        this.props.onBTCUSDPrice(price)
      })

      for (let ticker in balances) {
        if (ticker !== 'BTC') {
          chrome.binance.getTickerPrice(`${ticker}BTC`, (price: string) => {
            this.props.onAssetBTCPrice(ticker, price)
          })
        }
      }
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

  setInitialAsset (asset: string) {
    this.setState({
      initialAsset: asset,
      currenciesShowing: false
    })
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

  renderInvalidKeyView = () => {
    return (
      <InvalidWrapper>
        <InvalidTitle>
          {getLocale('binanceWidgetAccountDisconnected')}
        </InvalidTitle>
        <InvalidCopy>
          {getLocale('binanceWidgetInvalidText')}
        </InvalidCopy>
        <GenButton onClick={this.props.connectBinance}>
          {getLocale('binanceWidgetConfigureButton')}
        </GenButton>
      </InvalidWrapper>
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
      accountBalances,
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
          {accountBalances['BTC']} <TickerLabel>{getLocale('binanceWidgetBTCTickerText')}</TickerLabel>
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
    const { onBuyCrypto } = this.props
  
    return (
      <>
        <Copy>
          {'Buy Crypto'}
        </Copy>
        <BuyPromptWrapper>
          <FiatInputWrapper>
            <FiatInputField
              type={'text'}
              placeholder={'I want to spend...'}
              value={this.state.initialAmount}
              onChange={({ target }) => { this.setState({ initialAmount: target.value })}}
            />
            <FiatDropdown>
              <FiatDropdownLabel>
                {'USD'}
              </FiatDropdownLabel>
              <CaratDropdown>
                <CaratDownIcon />
              </CaratDropdown>
            </FiatDropdown>
          </FiatInputWrapper>
          <AssetDropdown
            itemsShowing={this.state.currenciesShowing}
            onClick={() => { this.setState({ currenciesShowing: !this.state.currenciesShowing })}}
          >
            <AssetDropdownLabel>
              {this.state.initialAsset}
            </AssetDropdownLabel>
            <CaratDropdown>
              <CaratDownIcon />
            </CaratDropdown>
          </AssetDropdown>
          {
            this.state.currenciesShowing
            ? <AssetItems>
                {this.currencies.map((asset: string, i: number) => {
                  if (asset === this.state.initialAsset) {
                    return null
                  }

                  return (
                    <AssetItem
                      key={`choice-${asset}`}
                      isLast={i === (this.currencies.length - 1)}
                      onClick={this.setInitialAsset.bind(this, asset)}
                    >
                      {asset}
                    </AssetItem>
                  )
                })}
              </AssetItems>
            : null
          }
        </BuyPromptWrapper>
        <ActionsWrapper>
          <ConnectButton onClick={onBuyCrypto}>
            {`Buy ${this.state.initialAsset}`}
          </ConnectButton>
        </ActionsWrapper>
      </>
    )
  }
  
  render () {
    const { userAuthed, authInProgress, apiCredsInvalid, connectBinance } = this.props

    if (apiCredsInvalid) {
      return (
        <WidgetWrapper>
          {this.renderInvalidKeyView()}
        </WidgetWrapper>
      )
    }

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
            : !userAuthed && !authInProgress
              ? <ConnectPrompt onClick={connectBinance}>
                  {'Connect'}
                </ConnectPrompt>
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
