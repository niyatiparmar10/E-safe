export function mockResponse(data, delay = 260) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), delay)
  })
}
