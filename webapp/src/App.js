import React, { Component } from 'react'

import generatePayload from 'promptpay-qr'
import qr from 'qrcode'

const ver = require('promptpay-qr/package.json').version

class QRCode extends Component {
  state = { svg: '' }
  componentDidMount () {
    this.update(this.props.payload)
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.payload !== this.props.payload) {
      this.update(nextProps.payload)
    }
  }
  update (payload) {
    this.payload = payload
    qr.toString(payload, { type: 'svg', errorCorrectionLevel: 'L' }, (err, svg) => {
      if (err) {
        window.alert('Cannot generate QR code: ' + String(err))
        return
      }
      if (this.payload === payload) {
        this.setState({ svg })
      }
    })
  }
  render () {
    return (
      <div className='qrcode' dangerouslySetInnerHTML={{ __html: this.state.svg }} />
    )
  }
}

class App extends Component {
  state = {
    id: String(window.localStorage.promptpayID || ''),
    amount: 0
  }
  onSet = () => {
    const id = window.prompt('Your phone number', this.state.id)
    if (id != null) {
      this.setState({ id })
      window.localStorage.promptpayID = id
    }
  }
  renderQR () {
    if (!this.state.id) {
      return (
        <div className='err'>
          {t('กดที่นี่เพื่อตั้งค่าเบอร์โทรศัพท์', 'Tap to set PromptPay ID')}
        </div>
      )
    } else {
      const payload = generatePayload(this.state.id, { amount: this.state.amount })
      return (
        <QRCode payload={payload} />
      )
    }
  }
  renderExplanation () {
    if (!this.state.id) {
      return (
        <span>{t('กดที่กล่องข้างบน เพื่อใส่เบอร์โทรศัพท์ที่ใช้รับเงิน', 'Tap above to get started')}</span>
      )
    } else {
      const id = this.state.id.replace(/[^0-9]/g, '')
      return (
        <span>
          {id.length >= 13 ? (
            t('QR code มีเลขประจำตัวของคุณ', 'QR code contains your ID')
          ) : (
            t('QR code มีเบอร์โทรศัพท์ของคุณ', 'QR code contains your phone number')
          )}
          : <strong onClick={this.onSet} style={{ color: '#bef', cursor: 'pointer' }}>{id}</strong>
        </span>
      )
    }
  }
  render () {
    return (
      <div className='App'>
        <div className='qr' onClick={this.onSet}>
          {this.renderQR()}
        </div>
        <div className='qr-explanation'>
          {this.renderExplanation()}
        </div>
        <form className='amount' onSubmit={e => { e.preventDefault() }}>
          <input
            className='amount'
            type='number'
            step={0.01}
            min={0}
            onChange={(e) => {
              this.setState({ amount: +e.target.value })
            }}
            autoFocus
          />
          {' '}
          {t('บาท', 'THB')}
        </form>
        <div className='tip'>
          <strong>Tip: </strong>Add to home screen for easier access
          <br />
          Powered by <a href='https://github.com/dtinth/promptpay-qr' target='_blank'>promptpay-qr</a>@{ver}
        </div>
      </div>
    )
  }
}

function t (th, en) {
  if (window.location.hostname === 'promptpay2.me' || window.location.hostname === 'dev.promptpay2.me') {
    return <span title={en}>{th}</span>
  }
  return <span title={th}>{en}</span>
}

export default App
