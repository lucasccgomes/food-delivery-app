import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'produto',
  title: 'Produto',
  type: 'document',
  fields: [
    {
      name: 'name',
      type: 'string',
      title: 'Nome do Produto',
      validation: rule=> rule.required()
    },
    {
      name: 'description',
      type: 'string',
      title: 'Descrição do Produto',
      validation: rule=> rule.required()
    },
    {
      name: 'image',
      type: 'image',
      title: 'image category',
    },
    {
        name: 'valor',
        type: 'number',
        title: 'Preço do Produto em Reais (R$)',
      },
  ],
})
