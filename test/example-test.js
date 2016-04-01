'use strict'
import { expect } from 'chai'
import Example from '../src/example'

describe('Example test', () => {
  it('should echo a string of text', () => {
    const example = new Example()
    const sampleString = 'Hello'
    expect(example.echo(sampleString)).to.equal(sampleString)
  })
})
