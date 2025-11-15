import NhaXuanBanService from "../services/nhaXuatBan.service.js";

const NhaXuatBanController = {
  // GET /nhaxuatban
  async getAll(req, res, next) {
    try {
      const data = await NhaXuanBanService.getAll();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  // GET /nhaxuatban/:id
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await NhaXuanBanService.getById(id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  // POST /nhaxuatban
  async create(req, res, next) {
    try {
      const data = await NhaXuanBanService.create(req.body);
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  },

  // PUT /nhaxuatban/:id
  async update(req, res, next) {
    try {
      const { id } = req.params;
      console.log(req.body);
      const data = await NhaXuanBanService.update(id, req.body);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  // DELETE /nhaxuatban/:id
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const success = await NhaXuanBanService.delete(id);
      res.json({ success });
    } catch (err) {
      next(err);
    }
  },
};

export default NhaXuatBanController;
