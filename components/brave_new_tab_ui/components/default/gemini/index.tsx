/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'
const clipboardCopy = require('clipboard-copy')

import createWidget from '../widget/index'
import {
  WidgetWrapper,
  Copy,
  BuyPromptWrapper,
  FiatInputWrapper,
  FiatInputField,
  FiatDropdown,
  CaratDropdown,
  ActionsWrapper,
  ConnectButton,
  Header,
  StyledTitle,
  BinanceIcon,
  StyledTitleText,
  AssetItems,
  AssetItem,
  DisconnectWrapper,
  DisconnectTitle,
  DisconnectCopy,
  DisconnectButton,
  DismissAction,
  InvalidWrapper,
  InvalidTitle,
  StyledEmoji,
  InvalidCopy,
  GenButton,
  ListItem,
  DetailIcons,
  BackArrow,
  ListImg,
  AssetTicker,
  AssetLabel,
  AssetQR,
  DetailArea,
  MemoArea,
  MemoInfo,
  DetailLabel,
  DetailInfo,
  ListIcon,
  SearchInput,
  ListLabel,
  BTCSummary,
  ListInfo,
  TradeLabel,
  Balance,
  BlurIcon,
  ConvertInfoWrapper,
  ConvertInfoItem,
  ConvertValue,
  ConvertLabel,
  NavigationBar,
  NavigationItem,
  SelectedView,
  ActionButton,
  AssetIcon,
  QRImage,
  CopyButton,
  DropdownIcon,
  IntroTitle,
  AssetIconWrapper
} from './style'
import {
  ShowIcon,
  HideIcon
} from './assets/icons'
import { StyledTitleTab } from '../widgetTitleTab'
import currencyData from './data'
import { CaratLeftIcon, CaratDownIcon } from 'brave-ui/components/icons'
import { getLocale } from '../../../../common/locale'
import searchIcon from './assets/search-icon.png'
import partyIcon from './assets/party.png'
import qrIcon from './assets/qr.png'
import geminiLogo from './assets/gemini-logo.png'

interface State {
  fiatShowing: boolean
  currenciesShowing: boolean
  currentDepositSearch: string
  currentDepositAsset: string
  currentTradeSearch: string
  currentTradeAsset: string
  currentTradeAmount: string
  currentConvertAmount: string
  currentConvertFrom: string
  currentConvertTo: string
  insufficientFunds: boolean
  showConvertPreview: boolean
  convertSuccess: boolean
  convertFailed: boolean
  convertError: string
  isBuyView: boolean
  currentQRAsset: string
  convertFromShowing: boolean
  convertToShowing: boolean
  currentConvertId: string
  currentConvertPrice: string
  currentConvertFee: string
  currentConvertTransAmount: string
  currentConvertExpiryTime: number
  userHasAuthed: boolean
}

interface Props {
  initialAmount: string
  initialFiat: string
  initialAsset: string
  showContent: boolean
  userTLDAutoSet: boolean
  userTLD: NewTab.BinanceTLD
  userAuthed: boolean
  authInProgress: boolean
  hideBalance: boolean
  btcBalanceValue: string
  accountBalances: Record<string, string>
  assetUSDValues: Record<string, string>
  assetBTCValues: Record<string, string>
  btcPrice: string
  binanceClientUrl: string
  assetDepositInfo: Record<string, any>
  assetDepoitQRCodeSrcs: Record<string, string>
  convertAssets: Record<string, string[]>
  accountBTCValue: string
  accountBTCUSDValue: string
  disconnectInProgress: boolean
  authInvalid: boolean
  selectedView: string
  onShowContent: () => void
  onDisableWidget: () => void
  onBuyCrypto: (coin: string, amount: string, fiat: string) => void
  onBinanceUserTLD: (userTLD: NewTab.BinanceTLD) => void
  onSetInitialFiat: (initialFiat: string) => void
  onSetInitialAmount: (initialAmount: string) => void
  onSetInitialAsset: (initialAsset: string) => void
  onSetUserTLDAutoSet: () => void
  onSetHideBalance: (hide: boolean) => void
  onBinanceClientUrl: (clientUrl: string) => void
  onDisconnectBinance: () => void
  onCancelDisconnect: () => void
  onConnectBinance: () => void
  onValidAuthCode: () => void
  onUpdateActions: () => void
  onDismissAuthInvalid: () => void
  onSetSelectedView: (view: string) => void
  getCurrencyList: () => string[]
}

class Gemini extends React.PureComponent<Props, State> {
  private currencyNames: Record<string, string>
  private cryptoColors: Record<string, string>
  private convertTimer: any
  private refreshInterval: any

  constructor (props: Props) {
    super(props)
    this.state = {
      fiatShowing: false,
      currenciesShowing: false,
      currentDepositSearch: '',
      currentDepositAsset: '',
      currentTradeSearch: '',
      currentTradeAsset: '',
      currentTradeAmount: '',
      currentConvertAmount: '',
      currentConvertFrom: 'BTC',
      currentConvertTo: 'BNB',
      currentConvertId: '',
      currentConvertPrice: '',
      currentConvertFee: '',
      currentConvertTransAmount: '',
      insufficientFunds: false,
      showConvertPreview: false,
      convertSuccess: false,
      convertFailed: false,
      convertError: '',
      isBuyView: true,
      currentQRAsset: '',
      convertFromShowing: false,
      convertToShowing: false,
      currentConvertExpiryTime: 30,
      userHasAuthed: false
    }
    this.cryptoColors = currencyData.cryptoColors
    this.currencyNames = {
      'BAT': 'Basic Attention Token',
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'XRP': 'Ripple',
      'BNB': 'Binance Coin',
      'BCH': 'Bitcoin Cash',
      'BUSD': 'US Dollar',
      'LINK': 'Chainlink',
      'LTC': 'Litecoin'
    }
  }

  componentDidMount () {
    const { userTLDAutoSet } = this.props

    if (this.props.userAuthed) {
      this.props.onUpdateActions()
      this.checkSetRefreshInterval()
    }

    if (this.props.authInProgress) {
      this.checkForOauthCode()
    }

    if (!userTLDAutoSet) {
      chrome.binance.getUserTLD((userTLD: NewTab.BinanceTLD) => {
        this.props.onBinanceUserTLD(userTLD)
        this.props.onSetUserTLDAutoSet()
      })
    }

    this.getClientURL()
  }

  getClientURL = () => {
    chrome.binance.getClientUrl((clientUrl: string) => {
      this.props.onBinanceClientUrl(clientUrl)
    })
  }

  componentWillUnmount () {
    clearInterval(this.refreshInterval)
  }

  componentDidUpdate (prevProps: Props) {
    if (!prevProps.userAuthed && this.props.userAuthed) {
      this.props.onUpdateActions()
      this.checkSetRefreshInterval()
    }

    if (prevProps.userAuthed && !this.props.userAuthed) {
      this.getClientURL()
      this.clearIntervals()
    }
  }

  checkSetRefreshInterval = () => {
    if (!this.refreshInterval) {
      this.refreshInterval = setInterval(() => {
        this.props.onUpdateActions()
      }, 30000)
    }
  }

  checkForOauthCode = () => {
    const params = window.location.search
    const urlParams = new URLSearchParams(params)
    const binanceAuth = urlParams.get('binanceAuth')

    if (binanceAuth) {
      chrome.binance.getAccessToken((success: boolean) => {
        if (success) {
          this.props.onValidAuthCode()
          this.props.onUpdateActions()
        }
      })
    }
  }

  clearIntervals = () => {
    clearInterval(this.convertTimer)
    clearInterval(this.refreshInterval)
  }

  connectBinance = () => {
    const { binanceClientUrl } = this.props
    window.open(binanceClientUrl, '_self', 'noopener')
    this.props.onConnectBinance()
  }

  connectGemini = () => {
    setTimeout(() => {
      this.setState({ userHasAuthed: true })
      this.props.onValidAuthCode()
    }, 1500)
  }

  cancelDisconnect = () => {
    this.props.onCancelDisconnect()
  }

  cancelConvert = () => {
    clearInterval(this.convertTimer)
    this.setState({
      insufficientFunds: false,
      showConvertPreview: false,
      convertSuccess: false,
      convertFailed: false,
      currentConvertAmount: '',
      currentConvertFrom: 'BTC',
      currentConvertTo: 'BNB',
      currentConvertId: '',
      currentConvertPrice: '',
      currentConvertFee: '',
      currentConvertTransAmount: '',
      currentConvertExpiryTime: 30
    })
  }

  retryConvert = () => {
    clearInterval(this.convertTimer)
    this.setState({
      insufficientFunds: false,
      showConvertPreview: false,
      convertSuccess: false,
      convertFailed: false,
      convertError: '',
      currentConvertId: '',
      currentConvertPrice: '',
      currentConvertFee: '',
      currentConvertTransAmount: '',
      currentConvertExpiryTime: 30
    })
  }

  finishDisconnect = () => {
    this.clearIntervals()
    chrome.binance.revokeToken(() => {
      this.props.onDisconnectBinance()
      this.cancelDisconnect()
    })
  }

  renderRoutes = () => {
    const { userAuthed } = this.props

    if (userAuthed && this.state.userHasAuthed) {
      return this.renderAccountView()
    }

    return this.renderBuyView()
  }

  onSetHideBalance = () => {
    this.props.onSetHideBalance(
      !this.props.hideBalance
    )
  }

  setSelectedView (view: string) {
    this.props.onSetSelectedView(view)
  }

  setCurrentDepositAsset (asset: string) {
    this.setState({
      currentDepositAsset: asset
    })

    if (!asset) {
      this.setState({
        currentDepositSearch: ''
      })
    }
  }

  setCurrentConvertAsset (asset: string) {
    this.setState({
      currentConvertTo: asset,
      convertToShowing: false
    })
  }

  setIsBuyView (isBuyView: boolean) {
    this.setState({ isBuyView })
  }

  processConvert = () => {
    const { currentConvertId } = this.state
    chrome.binance.confirmConvert(currentConvertId, (success: boolean, message: string) => {
      if (success) {
        this.setState({ convertSuccess: true })
      } else {
        this.setState({
          convertFailed: true,
          convertError: message
        })
      }
    })
  }

  setInitialAsset (asset: string) {
    this.setState({
      currenciesShowing: false
    })
    this.props.onSetInitialAsset(asset)
  }

  setInitialFiat (fiat: string) {
    this.setState({
      fiatShowing: false
    })
    this.props.onSetInitialFiat(fiat)
  }

  handleFiatChange = () => {
    const { userTLD } = this.props

    if (userTLD === 'us' || this.state.currenciesShowing) {
      return
    }

    this.setState({
      fiatShowing: !this.state.fiatShowing
    })
  }

  toggleCurrenciesShowing = () => {
    this.setState({ currenciesShowing: !this.state.currenciesShowing })
  }

  setInitialAmount = (e: any) => {
    const { value } = e.target

    if (isNaN(parseInt(value, 10)) && value.length > 0) {
      return
    }

    this.props.onSetInitialAmount(e.target.value)
  }

  toggleTLD = () => {
    const { userTLD } = this.props
    const newTLD = userTLD === 'com' ? 'us' : 'com'

    this.props.onBinanceUserTLD(newTLD)

    if (newTLD === 'us') {
      this.props.onSetInitialFiat('USD')
    }

    this.setState({
      fiatShowing: false,
      currenciesShowing: false
    })
  }

  finishConvert = () => {
    this.cancelConvert()
    this.props.onSetSelectedView('balance')
  }

  setCurrentDepositSearch = ({ target }: any) => {
    this.setState({
      currentDepositSearch: target.value
    })
  }

  setCurrentConvertAmount = ({ target }: any) => {
    this.setState({ currentConvertAmount: target.value })
  }

  setCurrentTradeSearch = ({ target }: any) => {
    this.setState({ currentTradeSearch: target.value })
  }

  setCurrentTradeAsset = (asset: string) => {
    this.setState({ currentTradeAsset: asset })
  }

  shouldShowConvertPreview = () => {
    // As there are trading fees we shouldn't proceed even in equal amounts
    /*
    if (!accountBalances[currentConvertFrom] ||
        parseFloat(currentConvertAmount) >= parseFloat(accountBalances[currentConvertFrom])) {
      this.setState({ insufficientFunds: true })
      return
    }
    */

    this.setState({
      currentConvertId: 'xxxx',
      currentConvertPrice: '9,372.23',
      currentConvertFee: '20.99',
      currentConvertTransAmount: '1',
      showConvertPreview: true
    })

    this.convertTimer = setInterval(() => {
      const { currentConvertExpiryTime } = this.state

      if (currentConvertExpiryTime - 1 === 0) {
        clearInterval(this.convertTimer)
        this.cancelConvert()
        return
      }

      this.setState({
        currentConvertExpiryTime: (currentConvertExpiryTime - 1)
      })
    }, 1000)

    /*
    chrome.binance.getConvertQuote(currentConvertFrom, currentConvertTo, currentConvertAmount, (quote: any) => {
      if (!quote.id || !quote.price || !quote.fee || !quote.amount) {
        this.setState({ convertFailed: true })
        return
      }

      this.setState({
        currentConvertId: quote.id,
        currentConvertPrice: quote.price,
        currentConvertFee: quote.fee,
        currentConvertTransAmount: quote.amount,
        showConvertPreview: true
      })

      this.convertTimer = setInterval(() => {
        const { currentConvertExpiryTime } = this.state

        if (currentConvertExpiryTime - 1 === 0) {
          clearInterval(this.convertTimer)
          this.cancelConvert()
          return
        }

        this.setState({
          currentConvertExpiryTime: (currentConvertExpiryTime - 1)
        })
      }, 1000)
    })
    */
  }

  setQR = (asset: string) => {
    this.setState({
      currentQRAsset: asset
    })
  }

  cancelQR = () => {
    this.setState({
      currentQRAsset: ''
    })
  }

  handleConvertFromChange = () => {
    if (this.state.convertFromShowing) {
      return
    }

    this.setState({
      convertFromShowing: !this.state.convertFromShowing
    })
  }

  handleConvertToChange = () => {
    if (this.state.convertToShowing) {
      return
    }

    this.setState({
      convertToShowing: !this.state.convertToShowing
    })
  }

  setCurrentConvertFrom = (asset: string) => {
    this.setState({
      convertFromShowing: false,
      currentConvertFrom: asset
    })
  }

  unpersistDropdowns = (event: any) => {
    const {
      fiatShowing,
      convertToShowing,
      convertFromShowing,
      currenciesShowing
    } = this.state

    if (!fiatShowing && !convertToShowing &&
        !convertFromShowing && !currenciesShowing) {
      return
    }

    if (!event.target.classList.contains('asset-dropdown')) {
      this.setState({
        fiatShowing: false,
        convertToShowing: false,
        convertFromShowing: false,
        currenciesShowing: false
      })
    }
  }

  copyToClipboard = async (address: string) => {
    try {
      await clipboardCopy(address)
    } catch (e) {
      console.log(`Could not copy address ${e.toString()}`)
    }
  }

  renderSmallIconAsset = (key: string, isDetail: boolean = false) => {
    const iconColor = this.cryptoColors[key] || '#fff'

    return (
      <AssetIcon
        isDetail={isDetail}
        style={{ color: iconColor }}
        className={`crypto-icon icon-${key}`}
      />
    )
  }

  renderIconAsset = (key: string, isDetail: boolean = false) => {
    const iconColor = this.cryptoColors[key] || '#fff'
    const styles = { color: '#000' }

    if (this.props.selectedView === 'balance') {
      styles['marginTop'] = '5px'
      styles['marginLeft'] = '5px'
    }

    return (
      <AssetIconWrapper style={{ background: iconColor }}      >
        <AssetIcon
          isDetail={isDetail}
          style={styles}
          className={`crypto-icon icon-${key}`}
        />
      </AssetIconWrapper>
    )
  }

  renderTitle () {
    return (
      <Header>
        <StyledTitle>
          <BinanceIcon>
            <img width={'30'} height={'25'} src={geminiLogo} />
          </BinanceIcon>
          <StyledTitleText>
            {'Gemini'}
          </StyledTitleText>
        </StyledTitle>
      </Header>
    )
  }

  renderTitleTab () {
    const { onShowContent } = this.props

    return (
      <StyledTitleTab onClick={onShowContent}>
        {this.renderTitle()}
      </StyledTitleTab>
    )
  }

  renderAuthInvalid = () => {
    const { onDismissAuthInvalid } = this.props

    return (
      <InvalidWrapper>
        <InvalidTitle>
          {getLocale('binanceWidgetAuthInvalid')}
        </InvalidTitle>
        <InvalidCopy>
          {getLocale('binanceWidgetAuthInvalidCopy')}
        </InvalidCopy>
        <GenButton onClick={onDismissAuthInvalid}>
          {getLocale('binanceWidgetDone')}
        </GenButton>
      </InvalidWrapper>
    )
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

  renderConvertSuccess = () => {
    const {
      currentConvertAmount,
      currentConvertFrom,
      currentConvertTo,
      currentConvertTransAmount
    } = this.state

    return (
      <InvalidWrapper>
        <StyledEmoji>
          <img src={partyIcon} />
        </StyledEmoji>
        <InvalidTitle>
          {`${getLocale('binanceWidgetConverted')} ${currentConvertAmount} ${currentConvertFrom} to ${currentConvertTransAmount} ${currentConvertTo}!`}
        </InvalidTitle>
        <ConnectButton isSmall={true} onClick={this.finishConvert}>
          {getLocale('binanceWidgetContinue')}
        </ConnectButton>
      </InvalidWrapper>
    )
  }

  renderInsufficientFundsView = () => {
    return (
      <InvalidWrapper>
        <InvalidTitle>
          {getLocale('binanceWidgetUnableToConvert')}
        </InvalidTitle>
        <InvalidCopy>
          {getLocale('binanceWidgetInsufficientFunds')}
        </InvalidCopy>
        <GenButton onClick={this.retryConvert}>
          {getLocale('binanceWidgetRetry')}
        </GenButton>
      </InvalidWrapper>
    )
  }

  renderUnableToConvertView = () => {
    const { convertError } = this.state
    const errorMessage = convertError || getLocale('binanceWidgetConversionFailed')

    return (
      <InvalidWrapper>
        <InvalidTitle>
          {getLocale('binanceWidgetUnableToConvert')}
        </InvalidTitle>
        <InvalidCopy>
          {errorMessage}
        </InvalidCopy>
        <GenButton onClick={this.retryConvert}>
          {getLocale('binanceWidgetRetry')}
        </GenButton>
      </InvalidWrapper>
    )
  }

  renderQRView = () => {
    const { assetDepoitQRCodeSrcs } = this.props
    const imageSrc = assetDepoitQRCodeSrcs[this.state.currentQRAsset]

    return (
      <InvalidWrapper>
        <QRImage src={imageSrc} />
        <GenButton onClick={this.cancelQR}>
          {getLocale('binanceWidgetDone')}
        </GenButton>
      </InvalidWrapper>
    )
  }

  formatCryptoBalance = (balance: string) => {
    if (!balance) {
      return '0'
    }

    return parseFloat(balance).toFixed(3)
  }

  renderCurrentDepositAsset = () => {
    const { currentDepositAsset } = this.state
    const assetDepositInfo = {
      'BTC': {
        address: 'n4VQ5YdHf7hLQ2gWQYYrcxoE5B7nWuDFNF',
        tag: null
      }
    }
    const addressInfo = assetDepositInfo[currentDepositAsset]
    const address = addressInfo && addressInfo.address
    const tag = addressInfo && addressInfo.tag
    const cleanName = this.currencyNames[currentDepositAsset]
    const cleanNameDisplay = cleanName ? `(${cleanName})` : ''
    const depositData = tag || address

    return (
      <>
        <ListItem style={{ padding: '10px 5px' }}>
          <DetailIcons>
            <BackArrow>
              <CaratLeftIcon
                onClick={this.setCurrentDepositAsset.bind(this, '')}
              />
            </BackArrow>
            {this.renderSmallIconAsset(currentDepositAsset.toLowerCase(), true)}
          </DetailIcons>
          <AssetTicker>
            {currentDepositAsset}
          </AssetTicker>
          <AssetLabel>
            {cleanNameDisplay}
          </AssetLabel>
          {
            depositData
            ? <AssetQR onClick={this.setQR.bind(this, currentDepositAsset)}>
                <img style={{ width: '25px', marginRight: '5px' }} src={qrIcon} />
              </AssetQR>
            : null
          }
        </ListItem>
        <DetailArea>
          {
            !depositData
            ? <MemoArea>
                <MemoInfo>
                  <DetailLabel>
                    {`${currentDepositAsset}`}
                  </DetailLabel>
                  <DetailInfo>
                    {getLocale('binanceWidgetAddressUnavailable')}
                  </DetailInfo>
                </MemoInfo>
              </MemoArea>
            : null
          }
          {
            address
            ? <MemoArea>
                <MemoInfo>
                  <DetailLabel>
                    {`${currentDepositAsset} ${getLocale('binanceWidgetDepositAddress')}`}
                  </DetailLabel>
                  <DetailInfo>
                    {address}
                  </DetailInfo>
                </MemoInfo>
                <CopyButton onClick={this.copyToClipboard.bind(this, address)}>
                  {getLocale('binanceWidgetCopy')}
                </CopyButton>
              </MemoArea>
            : null
          }
          {
            tag
            ? <MemoArea>
                <MemoInfo>
                  <DetailLabel>
                    {`${currentDepositAsset} ${getLocale('binanceWidgetDepositMemo')}`}
                  </DetailLabel>
                  <DetailInfo>
                    {tag}
                  </DetailInfo>
                </MemoInfo>
                <CopyButton onClick={this.copyToClipboard.bind(this, tag)}>
                  {getLocale('binanceWidgetCopy')}
                </CopyButton>
              </MemoArea>
            : null
          }
        </DetailArea>
      </>
    )
  }

  renderDepositView = () => {
    const { currencyNames } = this
    const { currentDepositSearch, currentDepositAsset } = this.state
    const currencyList = this.props.getCurrencyList()

    if (currentDepositAsset) {
      return this.renderCurrentDepositAsset()
    }

    return (
      <>
        <ListItem isDeposit={true}>
          <ListIcon>
            <ListImg src={searchIcon} />
          </ListIcon>
          <SearchInput
            type={'text'}
            placeholder={getLocale('binanceWidgetSearch')}
            onChange={this.setCurrentDepositSearch}
          />
        </ListItem>
        {currencyList.map((asset: string) => {
          const cleanName = currencyNames[asset] || asset
          const lowerAsset = asset.toLowerCase()
          const lowerName = cleanName.toLowerCase()
          const lowerSearch = currentDepositSearch.toLowerCase()
          const currencyName = currencyNames[asset] || false
          const nameString = currencyName ? `${currencyName}` : ''
          const toDisplay = nameString || asset

          if (lowerAsset.indexOf(lowerSearch) < 0 &&
              lowerName.indexOf(lowerSearch) < 0 && currentDepositSearch) {
            return null
          }

          return (
            <ListItem
              isDeposit={true}
              key={`list-${asset}`}
              onClick={this.setCurrentDepositAsset.bind(this, asset)}
            >
              <ListIcon>
                {this.renderIconAsset(asset.toLowerCase())}
              </ListIcon>
              <ListLabel clickable={true}>
                {`${toDisplay}`}
              </ListLabel>
            </ListItem>
          )
        })}
      </>
    )
  }

  renderSummaryView = () => {
    const {
      hideBalance,
      getCurrencyList
    } = this.props
    const currencyList = getCurrencyList()

    return (
      <>
        <BTCSummary>
          <ListInfo position={'left'}>
            <TradeLabel>
              <Balance isBTC={true} hideBalance={hideBalance}>
                {'$11,791.32'}
              </Balance>
            </TradeLabel>
          </ListInfo>
          <ListInfo position={'right'} isBTC={true}>
            <TradeLabel>
              <BlurIcon onClick={this.onSetHideBalance}>
                {
                  hideBalance
                  ? <ShowIcon />
                  : <HideIcon />
                }
              </BlurIcon>
            </TradeLabel>
          </ListInfo>
        </BTCSummary>
        {currencyList.map((asset: string) => {
          // Initial migration display
          const accountBalances = {
            'BTC': '1.512',
            'ETH': '10.52',
            'XRP': '0',
            'BCH': '0',
            'LTC': '0',
            'BAT': '0',
            'LINK': '0'
          }
          const assetAccountBalance = accountBalances ? accountBalances[asset] : '0'
          const assetBalance = this.formatCryptoBalance(assetAccountBalance)

          return (
            <ListItem key={`list-${asset}`}>
              <ListInfo isAsset={true} position={'left'}>
                <ListIcon>
                  {this.renderIconAsset(asset.toLowerCase())}
                </ListIcon>
                <ListLabel>
                  {this.currencyNames[asset] || asset}
                </ListLabel>
              </ListInfo>
              <ListInfo position={'right'}>
                <Balance isBTC={false} hideBalance={hideBalance}>
                  {assetBalance} {asset}
                </Balance>
              </ListInfo>
            </ListItem>
          )
        })}
      </>
    )
  }

  renderConvertConfirm = () => {
    const {
      currentConvertAmount,
      currentConvertFrom,
      currentConvertPrice,
      currentConvertFee,
      currentConvertExpiryTime
    } = this.state
    const displayConvertAmount = this.formatCryptoBalance(currentConvertAmount)
    const displayConvertFee = this.formatCryptoBalance(currentConvertFee)

    return (
      <InvalidWrapper>
        <InvalidTitle>
          {'Confirm Trade'}
        </InvalidTitle>
        <ConvertInfoWrapper>
          <ConvertInfoItem>
            <ConvertLabel>{'To Sell:'}</ConvertLabel>
            <ConvertValue>{`${displayConvertAmount} ${currentConvertFrom}`}</ConvertValue>
          </ConvertInfoItem>
          <ConvertInfoItem>
            <ConvertLabel>{getLocale('binanceWidgetFee')}</ConvertLabel>
            <ConvertValue>{`${displayConvertFee} USD`}</ConvertValue>
          </ConvertInfoItem>
          <ConvertInfoItem isLast={true}>
            <ConvertLabel>{getLocale('binanceWidgetWillReceive')}</ConvertLabel>
            <ConvertValue>{`${currentConvertPrice} USD`}</ConvertValue>
          </ConvertInfoItem>
        </ConvertInfoWrapper>
        <ActionsWrapper>
          <ConnectButton isSmall={true} onClick={this.processConvert}>
            {`Execute (${currentConvertExpiryTime}s)`}
          </ConnectButton>
          <DismissAction onClick={this.cancelConvert}>
            {getLocale('binanceWidgetCancel')}
          </DismissAction>
        </ActionsWrapper>
      </InvalidWrapper>
    )
  }

  renderConvertView = () => {
    const { convertAssets } = this.props
    const {
      currentConvertAmount,
      currentConvertFrom,
      convertFromShowing,
    } = this.state
    const convertAssetKeys = Object.keys(convertAssets)

    return (
      <>
        <Copy>
          {`${getLocale('binanceWidgetAvailable')} 1.512 ${currentConvertFrom}`}
        </Copy>
        <BuyPromptWrapper>
          <FiatInputWrapper>
            <FiatInputField
              type={'text'}
              placeholder={'I want to trade...'}
              value={currentConvertAmount}
              onChange={this.setCurrentConvertAmount}
            />
            <FiatDropdown
              className={'asset-dropdown'}
              itemsShowing={convertFromShowing}
              onClick={this.handleConvertFromChange}
            >
              <span>
                {currentConvertFrom}
              </span>
              <CaratDropdown>
                <CaratDownIcon />
              </CaratDropdown>
            </FiatDropdown>
            {
              convertFromShowing
              ? <AssetItems isFiat={true}>
                  {convertAssetKeys.map((asset: string, i: number) => {
                    if (asset === currentConvertFrom) {
                      return null
                    }

                    return (
                      <AssetItem
                        key={`choice-${asset}`}
                        isLast={i === convertAssetKeys.length - 1}
                        onClick={this.setCurrentConvertFrom.bind(this, asset)}
                      >
                        <DropdownIcon>
                          {this.renderSmallIconAsset(asset.toLowerCase())}
                        </DropdownIcon>
                        {asset}
                      </AssetItem>
                    )
                  })}
                </AssetItems>
              : null
            }
          </FiatInputWrapper>
        </BuyPromptWrapper>
        <ActionsWrapper>
          <ActionButton onClick={this.shouldShowConvertPreview}>
            {'Get a quote'}
          </ActionButton>
        </ActionsWrapper>
      </>
    )
  }

  renderSelectedView = () => {
    const { selectedView } = this.props

    switch (selectedView) {
      case 'deposit':
        return this.renderDepositView()
      case 'balance':
        return this.renderSummaryView()
      case 'trade':
        return this.renderConvertView()
      case 'buy':
        return this.renderBuyView()
      default:
        return this.renderSummaryView()
    }
  }

  renderAccountView = () => {
    const { selectedView } = this.props
    const { currentDepositAsset } = this.state
    const isSummaryView = !selectedView || selectedView === 'balance'
    const hideOverflow = currentDepositAsset && selectedView === 'deposit'

    return (
      <>
        <NavigationBar>
        <NavigationItem
            tabIndex={0}
            isActive={selectedView === 'deposit'}
            onClick={this.setSelectedView.bind(this, 'deposit')}
          >
            {getLocale('binanceWidgetDepositLabel')}
          </NavigationItem>
          <NavigationItem
            tabIndex={0}
            isActive={selectedView === 'trade'}
            onClick={this.setSelectedView.bind(this, 'trade')}
          >
            {getLocale('Trade')}
          </NavigationItem>
          <NavigationItem
            tabIndex={0}
            isLeading={true}
            isActive={isSummaryView}
            onClick={this.setSelectedView.bind(this, 'balance')}
          >
            {getLocale('Balance')}
          </NavigationItem>
        </NavigationBar>
        {
          selectedView === 'trade' || selectedView === 'buy'
          ? this.renderSelectedView()
          : <SelectedView hideOverflow={!!hideOverflow}>
              {this.renderSelectedView()}
            </SelectedView>
        }
      </>
    )
  }

  renderBuyView = () => {
    const { onDisableWidget } = this.props

    return (
      <>
        <IntroTitle>Purchase and trade with Gemini</IntroTitle>
        <Copy>
          {'Enable a Gemini connection to view your Gemini account balance and trade crypto.'}
        </Copy>
        <ActionsWrapper>
          {
            <>
              <ConnectButton onClick={this.connectGemini}>
                {getLocale('Connect to Gemini')}
              </ConnectButton>
              <DismissAction onClick={onDisableWidget}>
                {'No thank you'}
              </DismissAction>
            </>
          }
        </ActionsWrapper>
      </>
    )
  }

  renderIndexView () {
    const {
      currentQRAsset,
      insufficientFunds,
      convertFailed,
      convertSuccess,
      showConvertPreview
    } = this.state
    const {
      authInvalid,
      disconnectInProgress
    } = this.props

    if (authInvalid) {
      return this.renderAuthInvalid()
    } else if (currentQRAsset) {
      return this.renderQRView()
    } else if (insufficientFunds) {
      return this.renderInsufficientFundsView()
    } else if (convertFailed) {
      return this.renderUnableToConvertView()
    } else if (convertSuccess) {
      return this.renderConvertSuccess()
    } else if (showConvertPreview) {
      return this.renderConvertConfirm()
    } else if (disconnectInProgress) {
      return this.renderDisconnectView()
    } else {
      return false
    }
  }

  render () {
    const { showContent, userAuthed } = this.props

    if (!showContent) {
      return this.renderTitleTab()
    }

    return (
      <WidgetWrapper tabIndex={0} userAuthed={userAuthed && this.state.userHasAuthed} onClick={this.unpersistDropdowns}>
        {
          this.renderIndexView()
          ? this.renderIndexView()
          : <>
              {this.renderTitle()}
              {this.renderRoutes()}
            </>
        }
      </WidgetWrapper>
    )
  }
}

export const GeminiWidget = createWidget(Gemini)
