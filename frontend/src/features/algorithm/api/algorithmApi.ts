import { AlgorithmService } from '@services/algorithm.service';

export const algorithmApi = {
  getPublicAlgorithms: AlgorithmService.getPublicAlgorithms,
  getAllAlgorithms: AlgorithmService.getAllAlgorithms,
  getAlgorithmById: AlgorithmService.getAlgorithmById,
  createAlgorithm: AlgorithmService.createAlgorithm,
  updateAlgorithm: AlgorithmService.updateAlgorithm,
  deleteAlgorithm: AlgorithmService.deleteAlgorithm,
  setActiveAlgorithm: AlgorithmService.setActiveAlgorithm,
  installAlgorithm: AlgorithmService.installAlgorithm,
  pinAlgorithm: AlgorithmService.pinAlgorithm,
  unpinAlgorithm: AlgorithmService.unpinAlgorithm,
};
