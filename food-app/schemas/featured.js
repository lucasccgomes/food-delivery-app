import { defineType} from 'sanity'

export default defineType({
  name: 'apresente',
  title: 'Estabelecimento em destaque',
  type: 'document',
  fields: [
    {
      name: 'name',
      type: 'string',
      title: 'Nome do Estabelecimento',
      validation: rule=> rule.required(),
   },
   {
      name: 'descricao',
      type: 'string',
      title: 'Descrição',
      validation: rule=> rule.max(200),
   },
   {
      name: 'estabelecimento',
      type: 'array',
      title: 'Estabelecimento',
      of: [{type: 'reference', to: [{type: 'estabelecimento'}]}]
   }
  ],
})