// Cloudflare Worker - Firebase Proxy Backend
// This worker acts as a secure backend between your frontend and Firebase

// Your Firebase credentials (HIDDEN from frontend)
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD00-6EWTN4RsskroJ8G0FOHZzbSIYTy4s",
  databaseURL: "https://cirkle-careers-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cirkle-careers"
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Get all jobs
      if (path === '/api/jobs' && request.method === 'GET') {
        const response = await fetch(`${FIREBASE_CONFIG.databaseURL}/jobs.json`);
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create/Update job
      if (path === '/api/jobs' && request.method === 'POST') {
        const body = await request.json();
        const jobId = body.firebaseKey || Date.now().toString();
        
        const response = await fetch(
          `${FIREBASE_CONFIG.databaseURL}/jobs/${jobId}.json`,
          {
            method: 'PUT',
            body: JSON.stringify(body)
          }
        );
        
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Delete job
      if (path.startsWith('/api/jobs/') && request.method === 'DELETE') {
        const jobId = path.split('/')[3];
        
        const response = await fetch(
          `${FIREBASE_CONFIG.databaseURL}/jobs/${jobId}.json`,
          { method: 'DELETE' }
        );
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get all applications
      if (path === '/api/applications' && request.method === 'GET') {
        const response = await fetch(`${FIREBASE_CONFIG.databaseURL}/applications.json`);
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create application
      if (path === '/api/applications' && request.method === 'POST') {
        const body = await request.json();
        const appId = body.firebaseKey || Date.now().toString();
        
        const response = await fetch(
          `${FIREBASE_CONFIG.databaseURL}/applications/${appId}.json`,
          {
            method: 'PUT',
            body: JSON.stringify(body)
          }
        );
        
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Delete application
      if (path.startsWith('/api/applications/') && request.method === 'DELETE') {
        const appId = path.split('/')[3];
        
        const response = await fetch(
          `${FIREBASE_CONFIG.databaseURL}/applications/${appId}.json`,
          { method: 'DELETE' }
        );
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get all processed applications
      if (path === '/api/processed' && request.method === 'GET') {
        const response = await fetch(`${FIREBASE_CONFIG.databaseURL}/processed.json`);
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create/Update processed application
      if (path === '/api/processed' && request.method === 'POST') {
        const body = await request.json();
        const appId = body.firebaseKey || Date.now().toString();
        
        const response = await fetch(
          `${FIREBASE_CONFIG.databaseURL}/processed/${appId}.json`,
          {
            method: 'PUT',
            body: JSON.stringify(body)
          }
        );
        
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Delete processed application
      if (path.startsWith('/api/processed/') && request.method === 'DELETE') {
        const appId = path.split('/')[3];
        
        const response = await fetch(
          `${FIREBASE_CONFIG.databaseURL}/processed/${appId}.json`,
          { method: 'DELETE' }
        );
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get all chats
      if (path === '/api/chats' && request.method === 'GET') {
        const response = await fetch(`${FIREBASE_CONFIG.databaseURL}/chats.json`);
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Update chat
      if (path.startsWith('/api/chats/') && request.method === 'POST') {
        const chatId = path.split('/')[3];
        const body = await request.json();
        
        const response = await fetch(
          `${FIREBASE_CONFIG.databaseURL}/chats/${chatId}.json`,
          {
            method: 'PUT',
            body: JSON.stringify(body)
          }
        );
        
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Not found
      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
