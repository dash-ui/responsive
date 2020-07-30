global.document = {}

export const rollup = (config) => {
  if (config.output[0].format === 'umd') {
    config.external = ['@dash-ui/styles']
    config.output[0].globals = {
      '@dash-ui/styles': 'Dash',
    }
  }

  return config
}
