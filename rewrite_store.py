# -*- coding: utf-8 -*-
"""Complete rewrite of store/index.js with enterprise management functions."""

STORE_PATH = r'D:\项目\开发部\开发git\02\建筑行业检测及信息咨询公司agent\src\frontend\src\store\index.js'

# Read the original clean content up to the chatWithAgent function
original = open(STORE_PATH, 'r', encoding='utf-8').read()

# Find where chatWithAgent ends (the setTimeout block)
# We need to add closing braces + enterprise code + persist config
enterprise_code = '''
      // ========== 企业制度 ==========
      policies: [],
      fetchPolicies: async (category) => {
        try {
          const q = category ? `?category=${category}` : ''
          const data = await request(`/api/policies${q}`)
          set({ policies: data })
        } catch (e) { console.error('Fetch policies failed:', e) }
      },
      createPolicy: async (data) => {
        await request('/api/policies', { method: 'POST', body: data })
        get().fetchPolicies()
      },
      updatePolicy: async (id, data) => {
        await request(`/api/policies/${id}`, { method: 'PUT', body: data })
        get().fetchPolicies()
      },
      deletePolicy: async (id) => {
        await request(`/api/policies/${id}`, { method: 'DELETE' })
        get().fetchPolicies()
      },

      // ========== 资质管理 ==========
      qualifications: [],
      fetchQualifications: async () => {
        try {
          const data = await request('/api/qualifications')
          set({ qualifications: data })
        } catch (e) { console.error('Fetch qualifications failed:', e) }
      },
      createQualification: async (data) => {
        await request('/api/qualifications', { method: 'POST', body: data })
        get().fetchQualifications()
      },
      updateQualification: async (id, data) => {
        await request(`/api/qualifications/${id}`, { method: 'PUT', body: data })
        get().fetchQualifications()
      },
      deleteQualification: async (id) => {
        await request(`/api/qualifications/${id}`, { method: 'DELETE' })
        get().fetchQualifications()
      },
      qualificationStats: null,
      fetchQualificationStats: async () => {
        try {
          const data = await request('/api/stats/qualifications')
          set({ qualificationStats: data })
        } catch (e) {}
      },

      // ========== 培训管理 ==========
      trainingRecords: [],
      fetchTrainingRecords: async (staff_id) => {
        try {
          const q = staff_id ? `?staff_id=${staff_id}` : ''
          const data = await request(`/api/training-records${q}`)
          set({ trainingRecords: data })
        } catch (e) { console.error('Fetch training failed:', e) }
      },
      createTrainingRecord: async (data) => {
        await request('/api/training-records', { method: 'POST', body: data })
        get().fetchTrainingRecords()
      },
      trainingStats: null,
      fetchTrainingStats: async () => {
        try {
          const data = await request('/api/stats/training')
          set({ trainingStats: data })
        } catch (e) {}
      },

      // ========== 业务流程 ==========
      businessProcesses: [],
      fetchBusinessProcesses: async (category) => {
        try {
          const q = category ? `?category=${category}` : ''
          const data = await request(`/api/business-processes${q}`)
          set({ businessProcesses: data })
        } catch (e) { console.error('Fetch processes failed:', e) }
      },
      processSteps: {},
      fetchProcessSteps: async (process_id) => {
        try {
          const data = await request(`/api/process-steps/${process_id}`)
          set(prev => ({ ...prev, processSteps: { ...prev.processSteps, [process_id]: data } }))
        } catch (e) { console.error('Fetch steps failed:', e) }
      },

      // ========== 组织架构 ==========
      orgDepartments: [],
      fetchOrgDepartments: async () => {
        try {
          const data = await request('/api/org/departments')
          set({ orgDepartments: data })
        } catch (e) { console.error('Fetch org failed:', e) }
      },
'''

# The file currently ends with:
#         }, 1000)
#       },
#
# We need to close the store object and add persist config
closing = '''      },
    }),
    { name: 'jianjian-store' }
  )
)
'''

# Find the last valid line (the setTimeout block end)
lines = original.rstrip().split('\n')
# Find the line with just "      }," or similar ending
# Look for the end of chatWithAgent
end_idx = len(lines)
# Find the last line that is part of the function body
for i in range(len(lines)-1, -1, -1):
    if lines[i].strip() == '      },':
        end_idx = i + 1
        break

# Build the complete file
base = '\n'.join(lines[:end_idx])
content = base + enterprise_code + closing

open(STORE_PATH, 'w', encoding='utf-8').write(content)
print(f'Store rewritten. Lines: {content.count(chr(10))}')
print('Last 5 lines:')
for l in content.split('\n')[-5:]:
    print(repr(l))
