const AsyncHandler = require('../../middleware/AsyncHandler');
const MediaUtils = require('../../utils/Media.Utils');

/**
 * UtilsController
 * Handles auxiliary system operations such as media extraction and file orchestration.
 */
class UtilsController {
    /**
     * Extracts high-fidelity link preview metadata via the MediaUtils engine.
     */
    getLinkPreview = AsyncHandler(async (req, res) => {
        const { url } = req.query;

        if (!url) {
            return res.badRequest({ message: 'A target URL is required for preview extraction.' });
        }

        try {
            new URL(url);
        } catch (e) {
            return res.badRequest({ message: 'The provided URL format is invalid.' });
        }

        const previewData = await MediaUtils.fetchLinkPreview(url);

        if (!previewData) {
            return res.badRequest({ message: 'The platform could not extract high-fidelity metadata from the target URL.' });
        }

        return res.success(previewData);
    });

    /**
     * Orchestrates single-file uploads with standardized response telemetry.
     */
    uploadFile = AsyncHandler(async (req, res) => {
        if (!req.file) {
            return res.badRequest({ message: 'No file was provided for upload processing.' });
        }

        res.success({
            url: req.file.path || req.file.url,
            publicId: req.file.filename || req.file.publicId
        }, { message: 'Media artifact uploaded successfully.' });
    });
}

module.exports = new UtilsController();
