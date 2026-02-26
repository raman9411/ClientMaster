import { Router } from "express";
import { dbService } from "../services/dbService.js";

const router = Router();

// Get all clients
router.get("/", (req, res) => {
  try {
    res.json(dbService.getAllClients());
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

// Get a single client
router.get("/:id", (req, res) => {
  try {
    const client = dbService.getClientById(Number(req.params.id));
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    res.json(client);
  } catch (error) {
    console.error("Error fetching client:", error);
    res.status(500).json({ error: "Failed to fetch client" });
  }
});

// Create a new client
router.post("/", (req, res) => {
  if (!req.body.name) {
    return res.status(400).json({ error: "Client name is required" });
  }

  try {
    const newClient = dbService.createClient(req.body);
    res.status(201).json(newClient);
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(500).json({ error: "Failed to create client" });
  }
});

// Update a client
router.put("/:id", (req, res) => {
  if (!req.body.name) {
    return res.status(400).json({ error: "Client name is required" });
  }

  try {
    const updatedClient = dbService.updateClient(Number(req.params.id), req.body);
    if (!updatedClient) {
      return res.status(404).json({ error: "Client not found" });
    }
    res.json(updatedClient);
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({ error: "Failed to update client" });
  }
});

// Delete a client
router.delete("/:id", (req, res) => {
  try {
    const success = dbService.deleteClient(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ error: "Client not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({ error: "Failed to delete client" });
  }
});

export default router;
