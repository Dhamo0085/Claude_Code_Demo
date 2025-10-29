const express = require('express');
const router = express.Router();
const {
  calculateHealthScore,
  calculateDaysRemaining,
  calculateProgress,
  assessRisk,
  calculateConversionProbability,
  generateInsights
} = require('../utils/calculator');

module.exports = (db) => {
  // GET /api/pilots - Get all pilots
  router.get('/', async (req, res) => {
    try {
      const pilots = await db.getAllPilots();

      // Enhance each pilot with calculated metrics
      const enhancedPilots = await Promise.all(
        pilots.map(async (pilot) => {
          const [criteria, stakeholders, metrics] = await Promise.all([
            db.getSuccessCriteria(pilot.id),
            db.getStakeholders(pilot.id),
            db.getMetrics(pilot.id)
          ]);

          return {
            ...pilot,
            daysRemaining: calculateDaysRemaining(pilot),
            progress: calculateProgress(pilot),
            riskLevel: assessRisk(pilot, criteria, stakeholders),
            successCriteriaCount: criteria.length,
            stakeholderCount: stakeholders.length,
            metricsCount: metrics.length
          };
        })
      );

      res.json({
        success: true,
        count: enhancedPilots.length,
        data: enhancedPilots
      });
    } catch (error) {
      console.error('Error fetching pilots:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch pilots',
        message: error.message
      });
    }
  });

  // GET /api/pilots/:id - Get single pilot with all details
  router.get('/:id', async (req, res) => {
    try {
      const pilotId = parseInt(req.params.id);
      const pilot = await db.getPilotById(pilotId);

      if (!pilot) {
        return res.status(404).json({
          success: false,
          error: 'Pilot not found'
        });
      }

      // Get related data
      const [criteria, stakeholders, metrics] = await Promise.all([
        db.getSuccessCriteria(pilotId),
        db.getStakeholders(pilotId),
        db.getMetrics(pilotId)
      ]);

      // Calculate enhanced metrics
      const healthScore = calculateHealthScore(pilot, criteria, metrics);
      const conversionProb = calculateConversionProbability(pilot, criteria, stakeholders);
      const insights = generateInsights(pilot, criteria, stakeholders, metrics);

      res.json({
        success: true,
        data: {
          ...pilot,
          health_score: healthScore,
          conversion_probability: conversionProb,
          daysRemaining: calculateDaysRemaining(pilot),
          progress: calculateProgress(pilot),
          riskLevel: assessRisk(pilot, criteria, stakeholders),
          success_criteria: criteria,
          stakeholders: stakeholders,
          metrics: metrics,
          insights: insights
        }
      });
    } catch (error) {
      console.error('Error fetching pilot:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch pilot',
        message: error.message
      });
    }
  });

  // POST /api/pilots - Create new pilot
  router.post('/', async (req, res) => {
    try {
      const pilotData = req.body;

      // Validate required fields
      const requiredFields = [
        'company_name', 'industry', 'start_date', 'end_date',
        'status', 'contract_value', 'arr_projection', 'primary_contact'
      ];

      const missingFields = requiredFields.filter(field => !pilotData[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          missingFields: missingFields
        });
      }

      // Create pilot
      const pilot = await db.createPilot(pilotData);

      res.status(201).json({
        success: true,
        message: 'Pilot created successfully',
        data: pilot
      });
    } catch (error) {
      console.error('Error creating pilot:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create pilot',
        message: error.message
      });
    }
  });

  // PUT /api/pilots/:id - Update pilot
  router.put('/:id', async (req, res) => {
    try {
      const pilotId = parseInt(req.params.id);
      const updates = req.body;

      // Check if pilot exists
      const existingPilot = await db.getPilotById(pilotId);
      if (!existingPilot) {
        return res.status(404).json({
          success: false,
          error: 'Pilot not found'
        });
      }

      // Remove id from updates if present
      delete updates.id;
      delete updates.created_at;

      // Update pilot
      const updatedPilot = await db.updatePilot(pilotId, updates);

      res.json({
        success: true,
        message: 'Pilot updated successfully',
        data: updatedPilot
      });
    } catch (error) {
      console.error('Error updating pilot:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update pilot',
        message: error.message
      });
    }
  });

  // DELETE /api/pilots/:id - Delete pilot
  router.delete('/:id', async (req, res) => {
    try {
      const pilotId = parseInt(req.params.id);

      // Check if pilot exists
      const existingPilot = await db.getPilotById(pilotId);
      if (!existingPilot) {
        return res.status(404).json({
          success: false,
          error: 'Pilot not found'
        });
      }

      // Delete pilot (cascades to related records)
      const result = await db.deletePilot(pilotId);

      res.json({
        success: true,
        message: 'Pilot deleted successfully',
        data: result
      });
    } catch (error) {
      console.error('Error deleting pilot:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete pilot',
        message: error.message
      });
    }
  });

  // POST /api/pilots/:id/success-criteria - Add success criteria
  router.post('/:id/success-criteria', async (req, res) => {
    try {
      const pilotId = parseInt(req.params.id);
      const criteriaData = { ...req.body, pilot_id: pilotId };

      // Validate pilot exists
      const pilot = await db.getPilotById(pilotId);
      if (!pilot) {
        return res.status(404).json({
          success: false,
          error: 'Pilot not found'
        });
      }

      const criteria = await db.createSuccessCriteria(criteriaData);

      res.status(201).json({
        success: true,
        message: 'Success criteria added',
        data: criteria
      });
    } catch (error) {
      console.error('Error adding success criteria:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add success criteria',
        message: error.message
      });
    }
  });

  // PUT /api/pilots/success-criteria/:id - Update success criteria
  router.put('/success-criteria/:id', async (req, res) => {
    try {
      const criteriaId = parseInt(req.params.id);
      const updates = req.body;

      delete updates.id;
      delete updates.pilot_id;
      delete updates.created_at;

      const updated = await db.updateSuccessCriteria(criteriaId, updates);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: 'Success criteria not found'
        });
      }

      res.json({
        success: true,
        message: 'Success criteria updated',
        data: updated
      });
    } catch (error) {
      console.error('Error updating success criteria:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update success criteria',
        message: error.message
      });
    }
  });

  // POST /api/pilots/:id/stakeholders - Add stakeholder
  router.post('/:id/stakeholders', async (req, res) => {
    try {
      const pilotId = parseInt(req.params.id);
      const stakeholderData = { ...req.body, pilot_id: pilotId };

      // Validate pilot exists
      const pilot = await db.getPilotById(pilotId);
      if (!pilot) {
        return res.status(404).json({
          success: false,
          error: 'Pilot not found'
        });
      }

      const stakeholder = await db.createStakeholder(stakeholderData);

      res.status(201).json({
        success: true,
        message: 'Stakeholder added',
        data: stakeholder
      });
    } catch (error) {
      console.error('Error adding stakeholder:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add stakeholder',
        message: error.message
      });
    }
  });

  // GET /api/pilots/:id/calculate - Recalculate all metrics
  router.get('/:id/calculate', async (req, res) => {
    try {
      const pilotId = parseInt(req.params.id);
      const pilot = await db.getPilotById(pilotId);

      if (!pilot) {
        return res.status(404).json({
          success: false,
          error: 'Pilot not found'
        });
      }

      const [criteria, stakeholders, metrics] = await Promise.all([
        db.getSuccessCriteria(pilotId),
        db.getStakeholders(pilotId),
        db.getMetrics(pilotId)
      ]);

      const calculations = {
        health_score: calculateHealthScore(pilot, criteria, metrics),
        conversion_probability: calculateConversionProbability(pilot, criteria, stakeholders),
        days_remaining: calculateDaysRemaining(pilot),
        progress: calculateProgress(pilot),
        risk_level: assessRisk(pilot, criteria, stakeholders),
        insights: generateInsights(pilot, criteria, stakeholders, metrics)
      };

      // Update pilot with new health score and conversion probability
      await db.updatePilot(pilotId, {
        health_score: calculations.health_score,
        conversion_probability: calculations.conversion_probability
      });

      res.json({
        success: true,
        data: calculations
      });
    } catch (error) {
      console.error('Error calculating metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to calculate metrics',
        message: error.message
      });
    }
  });

  return router;
};
