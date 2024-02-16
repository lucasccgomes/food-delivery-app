import sanityClient from '../sanity/sanity.js';

export const getFeaturedEstablishment = () => {
    return sanityClient.fetch(
        `*[_type=='apresente']{
            ...,
            estabelecimento[]->{
              ...,
              produtos[]->{
                ...
              },
              tipo->{
                name
              }
            }
          }`
    );
}

export const getCategories = () => {
    return sanityClient.fetch(
        `*[_type=='category']`
    );
    
}

export const getFeaturedEstablishmentById = id => {
    console.log("ID recebido:", id);
    return sanityClient.fetch(
        `*[_type=='apresente'&&_id==$id]
        {
          ...,
          estabelecimento[]->{
            ...,
            produtos[]->,
              tipo->{
                name
              }
          }
        }[0]`,
        { id }
    ).then(data => {
        console.log("Dados retornados por getFeaturedEstablishmentById:", data);
        return data;
    }).catch(error => {
        console.error("Erro em getFeaturedEstablishmentById:", error);
        throw error; // Lançar o erro novamente para lidar com ele no componente
    });
}
