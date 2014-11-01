module.exports = {

  scalse: {
    check:      '[string]',

    cloud:      'string',
    instance:   '(none,standalone,controller,server)',

    controller: 'string',
    subPort:    '3000:number',
    reqPort:    '3001:number',

    cluster:    'string',
    cookie:     'node:string',
    strategy:   '(single,specialization,multiple,sticky)',
    workers:    '1:number',

    health:     '5s:duration',
    nagle:      'false:boolean',
    gcInterval: '10m:duration'
  },

  log: {
    keepDays:       '100:number',
    writeInterval:  '5s:duration',
    writeBuffer:    '64kb:size',
    applicationLog: 'false:boolean',
    serverLog:      'true:boolean'
  },

  sandbox: {
    global: '[array]',
    api:    '[array]'
  },

  servers: '{{server}}',

  plugins: 'string',

  server: {
    protocol: '(http,https)',
    address:  'string',
    port:     'number',
    nagle:    'false:boolean',
    slowTime: '4s:duration',
    key:      '[string]',
    cert:     '[string]'
  }

};
