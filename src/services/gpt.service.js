const knex = require("../config/knex");
const postService = require("./post.service");
const roomImageService = require("./room-image.service");

const retrieveByUserQuery = async (query) => {
  try {
    if (!query.includes("room_id")) {
      return [];
    }
    query = query.replace(";", "");
    const queryWithLimit = `${query} LIMIT 3`;

    const result = await knex.raw(queryWithLimit);
    console.log(result.rows[0])
    if (result.rows[0]) {
      if ("room_id" in result.rows[0]) {
        const roomIds = result.rows.map((row) => row.room_id);
        const [images, allPosts] = await Promise.all([
          roomImageService.retrieveAll(),
          postService.retrieveAll(),
        ]);
        let filteredPosts = allPosts
          .filter((post) => roomIds.includes(post.room_id))
          .map((post) => {
            const postImages = images.find(
              (img) => img.post_id === post.post_id
            );
            return {
              ...post,
              images: postImages ? postImages.images : [],
            };
          });
        return filteredPosts;
      } else {
        return result.rows;
      }
    } else {
      return [];
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = { retrieveByUserQuery };
