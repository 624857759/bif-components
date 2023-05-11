import { t } from '@obsidians/i18n'

export default {
  title: '星火令',
  list: [
    {
      name: 'gasLimit',
      alias: '星火令',
      className: 'col-12',
      label: t('contract.deploy.gasLimit'),
      icon: 'fas fa-burn',
      placeholder: '默认: 301,836,100',
      default: '301836100'
    }
  ]
}
