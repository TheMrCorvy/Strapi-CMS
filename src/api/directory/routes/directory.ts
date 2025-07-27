/**
 * directory router
 */

import { factories } from '@strapi/strapi';

const coreRouter = factories.createCoreRouter('api::directory.directory');

const customRoutes = [
    {
        method: 'POST',
        path: '/directories/bulk',
        handler: 'directory.bulkCreate',
    },
    {
        method: 'PATCH',
        path: '/directories/bulk',
        handler: 'directory.bulkUpdate',
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
            path: '/directories',
            handler: 'directory.find',
        },
        {
            method: 'GET',
            path: '/directories/:id',
            handler: 'directory.findOne',
        },
        {
            method: 'POST',
            path: '/directories',
            handler: 'directory.create',
        },
        {
            method: 'PUT',
            path: '/directories/:id',
            handler: 'directory.update',
        },
        {
            method: 'DELETE',
            path: '/directories/:id',
            handler: 'directory.delete',
        },
    ],
};
