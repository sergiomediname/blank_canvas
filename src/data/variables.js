const groups = {
  Font: [
    {
      name: 'font.body',
      description: 'Content font',
      type: 'font',
      default: 'normal normal 16px var(--default-font)'
    }
  ],
  Widths: [
    {
      name: 'width.container',
      description: 'Content width',
      type: 'length',
      min: '100px',
      max: '2000px',
      default: '1300px'
    },
    {
      name: 'width.sidebar',
      description: 'Sidebar width',
      type: 'length',
      min: '100px',
      max: '2000px',
      default: '1300px'
    },
    {
      name: 'width.post',
      description: 'Post width (stream)',
      type: 'length',
      min: '100px',
      max: '2000px',
      default: '1300px'
    }
  ]
}

module.exports = groups
