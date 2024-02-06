import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'estabelecimento',
    title: 'Estabelecimento',
    type: 'document',
    fields: [
        {
            name: 'name',
            type: 'string',
            title: 'Nome',
            validation: rule => rule.required()
        },
        {
            name: 'description',
            type: 'string',
            title: 'Descrição',
            validation: rule => rule.max(200)
        },
        {
            name: 'image',
            type: 'image',
            title: 'image do seu banner',
        },
        {
            name: 'lat',
            type: 'number',
            title: 'latitude do seu estabelecimento',
        },
        {
            name: 'lnt',
            type: 'number',
            title: 'longitude do seu estabelecimento',
        },
        {
            name: 'endereco',
            type: 'string',
            title: 'endereço do seu estabelecimento',
            validation: rule=> rule.required(),
          },
          {
            name: 'avaliacao',
            type: 'number',
            title: 'insira um numero entre 1 e 5',
            validation: rule=>rule.required().min(1).max(5).error('insira um numero entre 1 e 5')
          },
          {
            name: 'avaliacoes',
            type: 'string',
            title: 'Avaliações',
        },
        {
            name: 'tipo',
            title: 'Category',
            validation: rule=>rule.required(),
            type: 'reference',
            to: [{type: 'category'}]
        },
        {
            name: 'produtos',
            type: 'array',
            title: 'Produtos',
            validation: rule=>rule.required(),
            of: [{type: 'reference', to: [{type: 'produto'}]}]
        },
    ],
})
