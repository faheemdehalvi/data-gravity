// Generate realistic demo customer data for the Intelligence Engine

const CATEGORIES = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Beauty', 'Books']
const REGIONS = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East']

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals))
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export interface DemoCustomer {
  customer_id: string
  age: number
  annual_income: number
  spending_score: number
  membership_years: number
  purchase_frequency: number
  avg_purchase_value: number
  total_purchases: number
  last_purchase_days_ago: number
  support_tickets: number
  website_visits: number
  email_opens: number
  preferred_category: string
  region: string
}

export function generateDemoDataset(count: number = 500): DemoCustomer[] {
  const customers: DemoCustomer[] = []
  
  for (let i = 0; i < count; i++) {
    // Create customer archetypes for realistic clustering
    const archetype = Math.random()
    
    let customer: DemoCustomer
    
    if (archetype < 0.2) {
      // High-value loyalists (20%)
      customer = {
        customer_id: `HVL-${String(i + 1).padStart(5, '0')}`,
        age: randomBetween(35, 55),
        annual_income: randomBetween(80000, 200000),
        spending_score: randomBetween(75, 100),
        membership_years: randomBetween(5, 12),
        purchase_frequency: randomBetween(15, 30),
        avg_purchase_value: randomFloat(150, 500),
        total_purchases: randomBetween(100, 500),
        last_purchase_days_ago: randomBetween(1, 14),
        support_tickets: randomBetween(0, 3),
        website_visits: randomBetween(40, 100),
        email_opens: randomBetween(80, 100),
        preferred_category: pickRandom(CATEGORIES),
        region: pickRandom(REGIONS),
      }
    } else if (archetype < 0.35) {
      // At-risk champions (15%)
      customer = {
        customer_id: `ARC-${String(i + 1).padStart(5, '0')}`,
        age: randomBetween(30, 50),
        annual_income: randomBetween(60000, 150000),
        spending_score: randomBetween(50, 75),
        membership_years: randomBetween(3, 8),
        purchase_frequency: randomBetween(3, 8),
        avg_purchase_value: randomFloat(100, 300),
        total_purchases: randomBetween(50, 150),
        last_purchase_days_ago: randomBetween(45, 120),
        support_tickets: randomBetween(3, 10),
        website_visits: randomBetween(10, 30),
        email_opens: randomBetween(20, 50),
        preferred_category: pickRandom(CATEGORIES),
        region: pickRandom(REGIONS),
      }
    } else if (archetype < 0.55) {
      // New potential (20%)
      customer = {
        customer_id: `NWP-${String(i + 1).padStart(5, '0')}`,
        age: randomBetween(22, 40),
        annual_income: randomBetween(40000, 100000),
        spending_score: randomBetween(40, 70),
        membership_years: randomBetween(0, 2),
        purchase_frequency: randomBetween(5, 15),
        avg_purchase_value: randomFloat(30, 100),
        total_purchases: randomBetween(5, 30),
        last_purchase_days_ago: randomBetween(1, 30),
        support_tickets: randomBetween(0, 2),
        website_visits: randomBetween(20, 60),
        email_opens: randomBetween(50, 80),
        preferred_category: pickRandom(CATEGORIES),
        region: pickRandom(REGIONS),
      }
    } else if (archetype < 0.8) {
      // Casual browsers (25%)
      customer = {
        customer_id: `CSB-${String(i + 1).padStart(5, '0')}`,
        age: randomBetween(18, 65),
        annual_income: randomBetween(30000, 80000),
        spending_score: randomBetween(20, 50),
        membership_years: randomBetween(1, 5),
        purchase_frequency: randomBetween(1, 5),
        avg_purchase_value: randomFloat(15, 60),
        total_purchases: randomBetween(3, 20),
        last_purchase_days_ago: randomBetween(30, 90),
        support_tickets: randomBetween(0, 2),
        website_visits: randomBetween(5, 20),
        email_opens: randomBetween(10, 40),
        preferred_category: pickRandom(CATEGORIES),
        region: pickRandom(REGIONS),
      }
    } else {
      // Dormant users (20%)
      customer = {
        customer_id: `DRM-${String(i + 1).padStart(5, '0')}`,
        age: randomBetween(25, 60),
        annual_income: randomBetween(25000, 70000),
        spending_score: randomBetween(5, 25),
        membership_years: randomBetween(2, 7),
        purchase_frequency: randomBetween(0, 2),
        avg_purchase_value: randomFloat(10, 40),
        total_purchases: randomBetween(1, 10),
        last_purchase_days_ago: randomBetween(120, 365),
        support_tickets: randomBetween(0, 5),
        website_visits: randomBetween(0, 5),
        email_opens: randomBetween(0, 15),
        preferred_category: pickRandom(CATEGORIES),
        region: pickRandom(REGIONS),
      }
    }
    
    customers.push(customer)
  }
  
  return customers
}

export function demoDataToCSV(data: DemoCustomer[]): string {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const rows = data.map(row => 
    headers.map(h => {
      const val = row[h as keyof DemoCustomer]
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : val
    }).join(',')
  )
  
  return [headers.join(','), ...rows].join('\n')
}
