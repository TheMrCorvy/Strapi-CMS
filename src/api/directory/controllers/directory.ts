/**
 * directory controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
    'api::directory.directory',
    ({ strapi }) => ({
        // Bulk create directories
        async bulkCreate(ctx) {
            try {
                const { data } = ctx.request.body;

                if (!Array.isArray(data)) {
                    return ctx.badRequest('Data must be an array');
                }

                if (data.length === 0) {
                    return ctx.badRequest('Data array cannot be empty');
                }

                // Validate required fields for each directory
                for (let i = 0; i < data.length; i++) {
                    const item = data[i];
                    if (!item.display_name || !item.directory_path) {
                        return ctx.badRequest(
                            `Missing required fields for item at index ${i}`
                        );
                    }
                }

                // Create all directories in a transaction
                const createdDirectories = [];

                for (const directoryData of data) {
                    try {
                        const directory = await strapi.entityService.create(
                            'api::directory.directory',
                            {
                                data: {
                                    display_name: directoryData.display_name,
                                    directory_path:
                                        directoryData.directory_path,
                                    adult: directoryData.adult || false,
                                },
                            }
                        );
                        createdDirectories.push(directory);
                    } catch (error) {
                        // Handle unique constraint violations or other errors
                        if (
                            error.message.includes('duplicate') ||
                            error.message.includes('unique')
                        ) {
                            return ctx.conflict(
                                `Directory with path '${directoryData.directory_path}' already exists`
                            );
                        }
                        throw error;
                    }
                }

                ctx.body = {
                    data: createdDirectories,
                    meta: {
                        count: createdDirectories.length,
                    },
                };
            } catch (error) {
                strapi.log.error('Bulk create directories error:', error);
                return ctx.internalServerError(
                    'An error occurred while creating directories'
                );
            }
        },

        // Bulk update directories with relationships
        async bulkUpdate(ctx) {
            try {
                const { data } = ctx.request.body;

                if (!Array.isArray(data)) {
                    return ctx.badRequest('Data must be an array');
                }

                if (data.length === 0) {
                    return ctx.badRequest('Data array cannot be empty');
                }

                const updatedDirectories = [];
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
                        // First check if the directory exists
                        const existingDirectory =
                            await strapi.entityService.findOne(
                                'api::directory.directory',
                                updateData.id
                            );

                        if (!existingDirectory) {
                            errors.push({
                                id: updateData.id,
                                error: `Directory with id ${updateData.id} not found`,
                            });
                            continue;
                        }

                        // Prepare update data
                        const dataToUpdate: any = {};

                        if (updateData.display_name !== undefined) {
                            dataToUpdate.display_name = updateData.display_name;
                        }

                        if (updateData.adult !== undefined) {
                            dataToUpdate.adult = updateData.adult;
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

                        // Handle sub directories relationship
                        if (updateData.sub_directories !== undefined) {
                            if (
                                updateData.sub_directories === null ||
                                updateData.sub_directories.length === 0
                            ) {
                                dataToUpdate.sub_directories = [];
                            } else if (
                                Array.isArray(updateData.sub_directories)
                            ) {
                                // Verify all sub directories exist
                                const subDirIds = updateData.sub_directories;
                                const existingSubDirs =
                                    await strapi.entityService.findMany(
                                        'api::directory.directory',
                                        {
                                            filters: { id: { $in: subDirIds } },
                                            fields: ['id'],
                                        }
                                    );

                                const foundIds = existingSubDirs.map(
                                    dir => dir.id
                                );
                                const missingIds = subDirIds.filter(
                                    id => !foundIds.includes(id)
                                );

                                if (missingIds.length > 0) {
                                    errors.push({
                                        id: updateData.id,
                                        error: `Sub directories with ids [${missingIds.join(', ')}] not found`,
                                    });
                                    continue;
                                }
                                dataToUpdate.sub_directories = subDirIds;
                            }
                        }

                        // Update the directory
                        const directory = await strapi.entityService.update(
                            'api::directory.directory',
                            updateData.id,
                            {
                                data: dataToUpdate,
                                populate: [
                                    'parent_directory',
                                    'sub_directories',
                                    'anime_episodes',
                                ],
                            }
                        );

                        updatedDirectories.push(directory);
                    } catch (error) {
                        strapi.log.error(
                            `Error updating directory ${updateData.id}:`,
                            error
                        );
                        errors.push({
                            id: updateData.id,
                            error: error.message || 'Unknown error occurred',
                        });
                    }
                }

                const response: any = {
                    data: updatedDirectories,
                    meta: {
                        count: updatedDirectories.length,
                        total: data.length,
                        errors: errors.length,
                    },
                };

                if (errors.length > 0) {
                    response.errors = errors;
                }

                ctx.body = response;
            } catch (error) {
                strapi.log.error('Bulk update directories error:', error);
                return ctx.internalServerError(
                    'An error occurred while updating directories'
                );
            }
        },
        async findAll(ctx) {
            try {
                const { query } = ctx;
                const directories = await strapi.entityService.findMany(
                    'api::directory.directory',
                    {
                        limit: Number.MAX_SAFE_INTEGER,
                        populate: query.populate,
                    }
                );
                ctx.body = {
                    data: directories,
                    meta: {
                        count: directories.length,
                    },
                };
            } catch (error) {
                ctx.internalServerError('Failed to fetch directories');
            }
        },
    })
);
