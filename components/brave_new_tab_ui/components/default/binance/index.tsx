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
  FiatInputField,
  NavigationBar,
  NavigationItem,
  SelectedView,
  ListItem,
  ListIcon,
  ListImg,
  SearchInput,
  ListLabel,
  AssetLabel,
  DetailIcons,
  AssetTicker,
  AssetQR,
  MemoInfo,
  MemoArea,
  DetailArea,
  DetailLabel,
  DetailInfo,
  CopyButton,
  BackArrow,
  ListInfo,
  TradeLabel,
  BTCValueLabel,
  OtherValueLabel
} from './style'
import {
  BinanceLogo,
  ApiKeyIcon,
  SecretKeyIcon,
  DisconnectIcon
} from './assets/icons'

import createWidget from '../widget/index'
import { getLocale } from '../../../../common/locale'
import { CaratLeftIcon, CaratDownIcon, LoaderIcon } from 'brave-ui/components/icons'
import searchIcon from './assets/search-icon.png'
import { getUSDPrice } from '../../../binance-utils'

interface State {
  apiKey: string
  apiSecret: string
  disconnectInProgress: boolean
  initialAsset: string,
  initialAmount: string,
  currenciesShowing: boolean,
  selectedView: string
  currentDepositSearch: string
  currentDepositAsset: string
  currentTradeSearch: string
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
  assetBTCValues: Record<string, string>
  assetBTCVolumes: Record<string, string>
  btcPrice: string
  btcVolume: string
  connectBinance: () => void
  onBuyCrypto: (coin: string, amount: string) => void
  onBinanceDetails: () => void
  onBinanceDeposit: () => void
  onBinanceTrade: () => void
  onSetHideBalance: (hide: boolean) => void
  onGenerateNewKey: () => void
  onBinanceBalances: (balances: Record<string, string>) => void
  onBinanceUserTLD: (userTLD: NewTab.BinanceTLD) => void
  onBTCUSDPrice: (value: string) => void
  onBTCUSDVolume: (volume: string) => void
  onAssetBTCVolume: (ticker: string, volume: string) => void
  onAssetUSDPrice: (ticker: string, price: string) => void
  onAssetBTCPrice: (ticker: string, price: string) => void
  onSetApiKeys: (apiKey: string, apiSecret: string) => void
  onApiKeysInvalid: () => void
  onDisconnectBinance: () => void
}

class Binance extends React.PureComponent<Props, State> {
  private currencies: string[]
  private currencyNames: Record<string, string>

  constructor (props: Props) {
    super(props)
    this.state = {
      apiKey: '',
      apiSecret: '',
      disconnectInProgress: false,
      initialAsset: 'BTC',
      initialAmount: '',
      currenciesShowing: false,
      selectedView: 'deposit',
      currentDepositSearch: '',
      currentDepositAsset: '',
      currentTradeSearch: ''
    }
    this.currencies = [
      'BTC',
      'ETH',
      'XRP',
      'BNB',
      'BCH',
      'BUSD'      
    ]
    this.currencyNames =  {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'XRP': 'Ripple',
      'BNB': 'Binance Coin',
      'BCH': 'Bitcoin Cash',
      'BUSD': 'US Dollar'     
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
        'BAT': '550.35000',
        'XRP': '100.000000',
        'BNB': '5.0000000',
        'BCH': '200.000000',
        'BUSD': '15.0000000'
      }

      this.props.onBinanceBalances(balances)

      chrome.binance.getTickerPrice('BTCUSDT', (price: string) => {
        this.props.onBTCUSDPrice(price)
      })
      chrome.binance.getTickerVolume('BTCUSDT', (volume: string) => {
        this.props.onBTCUSDVolume(volume)
      })

      for (let ticker in balances) {     
        if (ticker !== 'BTC') {
          chrome.binance.getTickerVolume(`${ticker}BTC`, (volume: string) => {
            this.props.onAssetBTCVolume(ticker, volume)
          })   
          chrome.binance.getTickerPrice(`${ticker}BTC`, (price: string) => {
            this.props.onAssetBTCPrice(ticker, price)
          })
          chrome.binance.getTickerPrice(`${ticker}USDT`, (price: string) => {
            this.props.onAssetUSDPrice(ticker, price)
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

  setSelectedView (view: string) {
    this.setState({
      selectedView: view
    })
  }

  setCurrentDepositAsset (asset: string) {
    this.setState({
      currentDepositAsset: asset
    })
  }

  getRandomMemo () {
    let buff = ''
    const seed = '0123456789'
    for (let i = 0; i < 10; i++) {
      buff += seed[Math.floor(Math.random() * 9)]
    }
    return buff
  }

  getRandomAddress () {
    let buff = ''
    const seed = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    for (let i = 0; i < 30; i++) {
      buff += seed[Math.floor(Math.random() * 35)]
    }
    return buff
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

  renderCurrentDepositAsset = () => {
    const { currentDepositAsset } = this.state

    return (
      <>
        <ListItem>
          <DetailIcons>
            <BackArrow>
              <CaratLeftIcon onClick={this.setCurrentDepositAsset.bind(this, '')} />
            </BackArrow>
            <ListImg src={searchIcon} />
          </DetailIcons>
          <AssetTicker>
            {currentDepositAsset}
          </AssetTicker>
          <AssetLabel>
            {`(${this.currencyNames[currentDepositAsset]})`}
          </AssetLabel>
          <AssetQR>
            <ListImg src={searchIcon} />
          </AssetQR>
        </ListItem>
        <DetailArea>
          <MemoArea>
            <MemoInfo>
              <DetailLabel>
                {`${currentDepositAsset} Memo`}
              </DetailLabel>
              <DetailInfo>
                {this.getRandomMemo()}
              </DetailInfo>
            </MemoInfo>
            <CopyButton>
              {'Copy'}
            </CopyButton>
          </MemoArea>
          <MemoArea>
            <MemoInfo>
              <DetailLabel>
                {`${currentDepositAsset} Deposit Address`}
              </DetailLabel>
              <DetailInfo>
                {this.getRandomAddress()}
              </DetailInfo>
            </MemoInfo>
          </MemoArea>
        </DetailArea>
      </>   
    )
  }

  renderDepositView = () => {
    const { currencyNames } = this
    const { currentDepositSearch, currentDepositAsset } = this.state

    if (currentDepositAsset) {
      return this.renderCurrentDepositAsset()
    }

    return (
      <>
        <ListItem>
          <ListIcon>
            <ListImg src={searchIcon} />
          </ListIcon>
          <SearchInput
            type={'text'}
            placeholder={'Search'}
            onChange={({ target }) => {
              this.setState({ currentDepositSearch: target.value })
            }}
          />
        </ListItem>
        {this.currencies.map((asset: string) => {
          const cleanName = currencyNames[asset]
          const lowerAsset = asset.toLowerCase()
          const lowerName = cleanName.toLowerCase()
          const lowerSearch = currentDepositSearch.toLowerCase()

          if (lowerAsset.indexOf(lowerSearch) < 0 &&
              lowerName.indexOf(lowerSearch) < 0) {
            return null
          }

          return (
            <ListItem
              key={`list-${asset}`}
              onClick={this.setCurrentDepositAsset.bind(this, asset)}
            >
              <ListIcon>
                <ListImg src={searchIcon} />
              </ListIcon>
              <ListLabel>
                {`${asset} (${currencyNames[asset]})`}
              </ListLabel>
            </ListItem>
          )
        })}
      </>
    )
  }

  renderBuySellScreen = () => {

  }

  renderTradeView = () => {
    const { currencyNames } = this
    const { currentTradeSearch } = this.state
    const { accountBalances, btcPrice, btcVolume, btcBalanceValue, assetBTCValues, assetBTCVolumes } = this.props

    return (
      <>
        <ListItem>
          <ListIcon>
            <ListImg src={searchIcon} />
          </ListIcon>
          <SearchInput
            type={'text'}
            placeholder={'Search trading pairs'}
            onChange={({ target }) => {
              this.setState({ currentTradeSearch: target.value
            })}}
          />
        </ListItem>
        <ListItem>
          <ListInfo position={'left'}>
            <TradeLabel>
              <span style={{ color: '#fff' }}>{'BTC'}</span>
              <span>{' / USDT'}</span>
            </TradeLabel>
            <TradeLabel>
              {`Vol ${btcVolume}`}
            </TradeLabel>
          </ListInfo>
          <ListInfo position={'right'}>
            <BTCValueLabel>
              {accountBalances['BTC']}
            </BTCValueLabel>
            <TradeLabel>
              {`$${btcBalanceValue}`}
            </TradeLabel>
          </ListInfo>          
        </ListItem>
        {Object.keys(assetBTCValues).map((pair: string) => {
          const lowerPair = pair.toLowerCase()
          const cleanName = currencyNames[pair].toLowerCase()
          const lowerSearch = currentTradeSearch.toLowerCase()

          if (lowerPair.indexOf(lowerSearch) < 0 &&
              cleanName.indexOf(lowerSearch) < 0) {
            return null
          }

          return (
            <ListItem key={`trade-${pair}`}>
              <ListInfo position={'left'}>
                <TradeLabel>
                  <span style={{ color: '#fff' }}>{pair}</span>
                  <span>{' / BTC'}</span>
                </TradeLabel>
                <TradeLabel>
                  {`Vol ${assetBTCVolumes[pair]}`}
                </TradeLabel>
              </ListInfo>
              <ListInfo position={'right'}>
                <OtherValueLabel>
                  {assetBTCValues[pair]}
                </OtherValueLabel>
                <TradeLabel>
                  {`$${getUSDPrice(assetBTCValues[pair], btcPrice)}`}
                </TradeLabel>
              </ListInfo>
            </ListItem>
          )
        })}
      </>
    )
  }

  renderSummaryView = () => {
    return null
  }

  renderBuySellView = () => {
    return null
  }
  
  renderSelectedView = () => {
    const { selectedView } = this.state

    switch (selectedView) {
      case 'deposit':
        return this.renderDepositView()
      case 'trade':
        return this.renderTradeView()
      case 'summary':
        return this.renderSummaryView()
      default:
        return null
    }
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
    const { selectedView } = this.state

    return (
      <>
        <NavigationBar>
          <NavigationItem
            isActive={selectedView === 'deposit'}
            onClick={this.setSelectedView.bind(this, 'deposit')}>
            {'Deposit'}
          </NavigationItem>
          <NavigationItem
            isActive={selectedView === 'trade'}
            onClick={this.setSelectedView.bind(this, 'trade')}>
            {'Trade'}
          </NavigationItem>
          <NavigationItem
            isActive={selectedView === 'summary'}
            onClick={this.setSelectedView.bind(this, 'summary')}>
            {'Summary'}
          </NavigationItem>
          <NavigationItem
            isActive={selectedView === 'buy'}
            onClick={this.setSelectedView.bind(this, 'buy')}>
            {'Buy'}
          </NavigationItem>
        </NavigationBar>
        <SelectedView>
          {this.renderSelectedView()}
        </SelectedView>
      </>
    )
  }

  renderWelcomeView = () => {
    const { onBuyCrypto } = this.props
    const { initialAsset, initialAmount } = this.state
  
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
              value={initialAmount}
              onChange={({ target }) => {
                this.setState({ initialAmount: target.value })
              }}
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
            onClick={() => { this.setState({
              currenciesShowing: !this.state.currenciesShowing
            })}}
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
                  if (asset === initialAsset) {
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
          <ConnectButton onClick={onBuyCrypto.bind(this, initialAsset, initialAmount)}>
            {`Buy ${initialAsset}`}
          </ConnectButton>
        </ActionsWrapper>
      </>
    )
  }
  
  render () {
    const { userAuthed, authInProgress, apiCredsInvalid, connectBinance } = this.props

    if (this.state.selectedView === 'buy') {
      return (
        <WidgetWrapper>
          {this.renderBuySellView()}
        </WidgetWrapper>
      )
    }

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
