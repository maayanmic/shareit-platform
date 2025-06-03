import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import cors from "cors";

// Middleware to enable CORS
const enableCors = cors({
  origin: true,
  credentials: true,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Prefix all routes with /api
  app.use("/api", enableCors);

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "Error creating user" });
    }
  });

  // Business routes
  app.get("/api/businesses", async (req, res) => {
    try {
      const businesses = await storage.getBusinesses();
      res.json(businesses);
    } catch (error) {
      res.status(500).json({ message: "Error fetching businesses" });
    }
  });

  app.get("/api/businesses/:id", async (req, res) => {
    try {
      const business = await storage.getBusiness(req.params.id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      res.json(business);
    } catch (error) {
      res.status(500).json({ message: "Error fetching business" });
    }
  });

  // Recommendation routes
  app.get("/api/recommendations", async (req, res) => {
    try {
      const recommendations = await storage.getRecommendations();
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching recommendations" });
    }
  });

  app.get("/api/recommendations/:id", async (req, res) => {
    try {
      const recommendation = await storage.getRecommendation(req.params.id);
      if (!recommendation) {
        return res.status(404).json({ message: "Recommendation not found" });
      }
      res.json(recommendation);
    } catch (error) {
      res.status(500).json({ message: "Error fetching recommendation" });
    }
  });

  app.post("/api/recommendations", async (req, res) => {
    try {
      const recommendation = await storage.createRecommendation(req.body);
      res.status(201).json(recommendation);
    } catch (error) {
      res.status(500).json({ message: "Error creating recommendation" });
    }
  });

  // Saved offers routes
  app.get("/api/saved-offers", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "userId query parameter is required" });
      }
      const savedOffers = await storage.getSavedOffers(userId);
      res.json(savedOffers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching saved offers" });
    }
  });

  app.post("/api/saved-offers", async (req, res) => {
    try {
      const savedOffer = await storage.saveOffer(req.body);
      res.status(201).json(savedOffer);
    } catch (error) {
      res.status(500).json({ message: "Error saving offer" });
    }
  });

  app.patch("/api/saved-offers/:id/claim", async (req, res) => {
    try {
      const updatedOffer = await storage.claimOffer(req.params.id, req.body.referrerId);
      res.json(updatedOffer);
    } catch (error) {
      res.status(500).json({ message: "Error claiming offer" });
    }
  });

  // Wallet/coins routes
  app.get("/api/users/:id/wallet", async (req, res) => {
    try {
      const wallet = await storage.getUserWallet(parseInt(req.params.id));
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: "Error fetching wallet" });
    }
  });

  app.patch("/api/users/:id/wallet", async (req, res) => {
    try {
      const wallet = await storage.updateUserWallet(parseInt(req.params.id), req.body.coins);
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: "Error updating wallet" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
