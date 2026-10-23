import { thompsonSample } from './thompson-sampling'

const N = 10000
let sum = 0
for (let i = 0; i < N; i++) {
  sum += thompsonSample(10, 2)
}
const mean = sum / N
const expected = 10 / (10 + 2)

console.log(`Mean: ${mean.toFixed(4)}, Expected: ${expected.toFixed(4)}`)
if (Math.abs(mean - expected) < 0.02) {
  console.log('PASS: Thompson Sampling math is correct')
} else {
  console.log('FAIL: Thompson Sampling math is BROKEN')
  process.exit(1)
}
