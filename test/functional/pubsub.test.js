const { describe, it } = require('mocha')
const assert = require('assert')
const { createProxyClient, createProxyServer, closeProxyServer } = require('../../lib')
const mockWindow = require('../helpers/mock-window')

describe('pubsub', () => {
  it('should automatically unsubscribe subscriptions on close', async () => {
    const serverWin = mockWindow()
    const clientWin = mockWindow()

    const mockIpfs = {
      _subs: [],
      pubsub: {
        subscribe (topic, opts, handler) {
          handler = handler || opts
          mockIpfs._subs.push({ topic, handler })
          return Promise.resolve()
        },
        unsubscribe (topic, handler) {
          mockIpfs._subs = mockIpfs._subs.filter(sub => {
            return !(sub.topic === topic && sub.handler === handler)
          })
        }
      }
    }

    const ipfsServer = createProxyServer(() => mockIpfs, {
      addListener: serverWin.addEventListener,
      removeListener: serverWin.removeEventListener,
      postMessage: clientWin.postMessage
    })

    const ipfsClient = createProxyClient({
      addListener: clientWin.addEventListener,
      removeListener: clientWin.removeEventListener,
      postMessage: serverWin.postMessage
    })

    // Subscribe and leave open
    const topic = `test${Date.now()}`
    const handler = () => {}
    await ipfsClient.pubsub.subscribe(topic, handler)

    // Check the subscription was registered
    assert.equal(mockIpfs._subs.length, 1)
    assert.equal(mockIpfs._subs[0].topic, topic)

    // Close the proxy server without unsubscribing
    closeProxyServer(ipfsServer)

    assert.equal(mockIpfs._subs.length, 0)
  })
})
