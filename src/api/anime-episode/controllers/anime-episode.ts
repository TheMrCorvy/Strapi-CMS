/**
 * anime-episode controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
    'api::anime-episode.anime-episode',
    ({ strapi }) => ({
        // Bulk create anime episodes
        async bulkCreate(ctx) {
            try {
                const { data } = ctx.request.body;

                if (!Array.isArray(data)) {
                    return ctx.badRequest('Data must be an array');
                }

                if (data.length === 0) {
                    return ctx.badRequest('Data array cannot be empty');
                }

                // Validate required fields for each anime episode
                for (let i = 0; i < data.length; i++) {
                    const item = data[i];
                    if (!item.display_name || !item.file_path) {
                        return ctx.badRequest(
                            `Missing required fields for item at index ${i}`
                        );
                    }
                }

                // Create all anime episodes in a transaction
                const createdAnimeEpisodes = [];

                for (const episodeData of data) {
                    try {
                        const animeEpisode = await strapi.entityService.create(
                            'api::anime-episode.anime-episode',
                            {
                                data: {
                                    display_name: episodeData.display_name,
                                    file_path: episodeData.file_path,
                                    parent_directory:
                                        episodeData.parent_directory,
                                },
                            }
                        );
                        createdAnimeEpisodes.push(animeEpisode);
                    } catch (error) {
                        // Handle unique constraint violations or other errors
                        if (
                            error.message.includes('duplicate') ||
                            error.message.includes('unique')
                        ) {
                            return ctx.conflict(
                                `Anime episode with file path '${episodeData.file_path}' already exists`
                            );
                        }
                        throw error;
                    }
                }

                ctx.body = {
                    data: createdAnimeEpisodes,
                    meta: {
                        count: createdAnimeEpisodes.length,
                    },
                };
            } catch (error) {
                strapi.log.error('Bulk create anime episodes error:', error);
                return ctx.internalServerError(
                    'An error occurred while creating anime episodes'
                );
            }
        },

        // Bulk update anime episodes with relationships
        async bulkUpdate(ctx) {
            try {
                const { data } = ctx.request.body;

                if (!Array.isArray(data)) {
                    return ctx.badRequest('Data must be an array');
                }

                if (data.length === 0) {
                    return ctx.badRequest('Data array cannot be empty');
                }

                const updatedAnimeEpisodes = [];

                for (const updateData of data) {
                    if (!updateData.id) {
                        return ctx.badRequest(
                            'Each update item must have an id'
                        );
                    }

                    try {
                        // Prepare update data
                        const dataToUpdate: any = {};

                        if (updateData.display_name) {
                            dataToUpdate.display_name = updateData.display_name;
                        }

                        // Handle parent directory relationship
                        if (updateData.parent_directory !== undefined) {
                            if (updateData.parent_directory === null) {
                                dataToUpdate.parent_directory = null;
                            } else if (
                                typeof updateData.parent_directory === 'number'
                            ) {
                                // Verify parent directory exists
                                const parentExists =
                                    await strapi.entityService.findOne(
                                        'api::directory.directory',
                                        updateData.parent_directory
                                    );
                                if (!parentExists) {
                                    return ctx.badRequest(
                                        `Parent directory with id ${updateData.parent_directory} not found`
                                    );
                                }
                                dataToUpdate.parent_directory =
                                    updateData.parent_directory;
                            }
                        }

                        const animeEpisode = await strapi.entityService.update(
                            'api::anime-episode.anime-episode',
                            updateData.id,
                            {
                                data: dataToUpdate,
                                populate: 'parent_directory',
                            }
                        );

                        updatedAnimeEpisodes.push(animeEpisode);
                    } catch (error) {
                        if (error.message.includes('not found')) {
                            return ctx.notFound(
                                `Anime episode with id ${updateData.id} not found`
                            );
                        }
                        throw error;
                    }
                }

                ctx.body = {
                    data: updatedAnimeEpisodes,
                    meta: {
                        count: updatedAnimeEpisodes.length,
                    },
                };
            } catch (error) {
                strapi.log.error('Bulk update anime episodes error:', error);
                return ctx.internalServerError(
                    'An error occurred while updating anime episodes'
                );
            }
        },
    })
);
