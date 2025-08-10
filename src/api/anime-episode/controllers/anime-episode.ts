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
                const errors = [];

                for (const updateData of data) {
                    if (!updateData.id) {
                        errors.push({
                            item: updateData,
                            error: 'Each update item must have an id',
                        });
                        continue;
                    }

                    try {
                        // First check if the anime episode exists
                        const existingEpisode =
                            await strapi.entityService.findOne(
                                'api::anime-episode.anime-episode',
                                updateData.id
                            );

                        if (!existingEpisode) {
                            errors.push({
                                id: updateData.id,
                                error: `Anime episode with id ${updateData.id} not found`,
                            });
                            continue;
                        }

                        // Prepare update data
                        const dataToUpdate: any = {};

                        if (updateData.display_name !== undefined) {
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
                                    errors.push({
                                        id: updateData.id,
                                        error: `Parent directory with id ${updateData.parent_directory} not found`,
                                    });
                                    continue;
                                }
                                dataToUpdate.parent_directory =
                                    updateData.parent_directory;
                            }
                        }

                        // Update the anime episode
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
                        strapi.log.error(
                            `Error updating anime episode ${updateData.id}:`,
                            error
                        );
                        errors.push({
                            id: updateData.id,
                            error: error.message || 'Unknown error occurred',
                        });
                    }
                }

                const response: any = {
                    data: updatedAnimeEpisodes,
                    meta: {
                        count: updatedAnimeEpisodes.length,
                        total: data.length,
                        errors: errors.length,
                    },
                };

                if (errors.length > 0) {
                    response.errors = errors;
                }

                ctx.body = response;
            } catch (error) {
                strapi.log.error('Bulk update anime episodes error:', error);
                return ctx.internalServerError(
                    'An error occurred while updating anime episodes'
                );
            }
        },
        async findAll(ctx) {
            try {
                const { query } = ctx;
                const episodes = await strapi.entityService.findMany(
                    'api::anime-episode.anime-episode',
                    {
                        limit: Number.MAX_SAFE_INTEGER,
                        populate: query.populate,
                    }
                );
                ctx.body = {
                    data: episodes,
                    meta: {
                        count: episodes.length,
                    },
                };
            } catch (error) {
                ctx.internalServerError('Failed to fetch episodes');
            }
        },
    })
);
