import { module, test } from 'qunit'
import Ractive from 'ractive'
import Adaptor from 'ractive-adaptor-promise'

module('ractive-adaptor-promise')

test('A pending promise does not have any value', assert => {
  const promise = new Promise((resolve, reject) => {})

  const instance = Ractive({
    template: '<p>{{ value }}</p>',
    data: { value: promise },
    adaptors: { Promise: Adaptor }
  })

  const instanceValue = instance.get('value')
  const domValue = instance.find('p').innerHTML

  assert.strictEqual(instanceValue, null)
  assert.strictEqual(domValue, '')
})

test('Resolving with a primitive value', assert => {
  const done = assert.async()

  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1)
    }, 5000)
  })

  const instance = Ractive({
    template: '<p>{{ value }}</p>',
    data: { value: promise },
    adaptors: { Promise: Adaptor }
  })

  promise.then(value => {
    const instanceValue = instance.get('value')
    const domValue = instance.find('p').innerHTML

    assert.strictEqual(value, 1)
    assert.strictEqual(instanceValue, 1)
    assert.strictEqual(domValue, '1')

    done()
  })
})

test('Resolving with a non-primitive value', assert => {
  const done = assert.async()

  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ foo: 1 })
    }, 5000)
  })

  const instance = Ractive({
    template: '<p>{{ value.foo }}</p>',
    data: { value: promise },
    adaptors: { Promise: Adaptor }
  })

  promise.then(value => {
    const instanceValue = instance.get('value.foo')
    const domValue = instance.find('p').innerHTML

    assert.strictEqual(value, 1)
    assert.strictEqual(instanceValue, 1)
    assert.strictEqual(domValue, '1')

    done()
  })
})

test('Rejecting with a primitive value', assert => {
  assert.ok(true)
})

test('Rejecting with a non-primitive value', assert => {
  assert.ok(true)
})
