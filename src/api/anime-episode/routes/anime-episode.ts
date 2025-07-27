/**
 * anime-episode router
 */

import { factories } from '@strapi/strapi';

const coreRouter = factories.createCoreRouter(
    'api::anime-episode.anime-episode'
);

const customRoutes = [
    {
        method: 'POST',
        path: '/anime-episodes/bulk',
        handler: 'anime-episode.bulkCreate',
    },
    {
        method: 'PATCH',
        path: '/anime-episodes/bulk',
        handler: 'anime-episode.bulkUpdate',
    },
];

// Export the combined routes
export default {
    type: 'content-api',
    routes: [
        // Add custom routes first
        ...customRoutes,
        // Then add default CRUD routes
        {
            method: 'GET',
            path: '/anime-episodes',
            handler: 'anime-episode.find',
        },
        {
            method: 'GET',
            path: '/anime-episodes/:id',
            handler: 'anime-episode.findOne',
        },
        {
            method: 'POST',
            path: '/anime-episodes',
            handler: 'anime-episode.create',
        },
        {
            method: 'PUT',
            path: '/anime-episodes/:id',
            handler: 'anime-episode.update',
        },
        {
            method: 'DELETE',
            path: '/anime-episodes/:id',
            handler: 'anime-episode.delete',
        },
    ],
};
