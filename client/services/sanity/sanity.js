import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const config = {
  projectId: 'rz2px94b',
  dataset: 'production', 
  useCdn: true,
  apiVersion: '2023-05-03', 
};

const sanityClient = createClient(config);

const builder = imageUrlBuilder(sanityClient);

export const urlFor = (source) => builder.image(source);

export default sanityClient;
